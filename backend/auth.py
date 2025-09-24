import os
from flask import request, current_app
from flask_restx import Namespace, Resource, fields
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from functools import wraps
import jwt

from extensions import db
from models import User
from utils.email_utils import generate_otp, send_email
from config import Config, allowed_file

# --- Namespace ---
auth_ns = Namespace("auth", description="Authentication operations")

# --- Models ---
register_model = auth_ns.model("Register", {
    "first_name": fields.String(required=True),
    "last_name": fields.String(required=True),
    "email": fields.String(required=True),
    "password": fields.String(required=True),
    "mobile_number": fields.String(required=False),
    "profile_pic": fields.String(required=False),
    "role": fields.String(required=False, default="user"),
    "is_admin_creation": fields.Boolean(required=False, default=False)
})

login_model = auth_ns.model("Login", {
    "email": fields.String(required=True),
    "password": fields.String(required=True)
})

# --- OTP storage ---
otp_store = {}  # {email: {"otp": "...", "data":..., "profile_pic":..., "expires": datetime}}

# --- JWT Token Creation ---
def create_tokens(user):
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    access = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")
    refresh_payload = {"sub": user.id, "exp": datetime.utcnow() + timedelta(days=7)}
    refresh = jwt.encode(refresh_payload, Config.JWT_SECRET_KEY, algorithm="HS256")
    return access, refresh

# --- Token Required Decorator ---
def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            return {"message": "Missing token"}, 401
        token = auth.split(" ", 1)[1]
        try:
            data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
            user = User.query.get(data["sub"])
            if not user:
                return {"message": "User not found"}, 404
            request.current_user = user
        except Exception as e:
            return {"message": "Invalid or expired token", "error": str(e)}, 401
        return f(*args, **kwargs)
    return wrapper

# --- Register Endpoint ---
@auth_ns.route("/register")
class Register(Resource):
    @auth_ns.expect(register_model)
    def post(self):
        # Accept form-data if file uploaded
        data = request.form.to_dict() if request.form else request.json
        email = (data.get("email") or "").lower()

        if User.query.filter_by(email=email).first():
            return {"message": "Email already registered"}, 400

        # --- Check if admin is creating this user ---
        is_admin_creation = data.get("is_admin_creation", False)
        if isinstance(is_admin_creation, str):
            is_admin_creation = is_admin_creation.lower() == "true"
        elif not isinstance(is_admin_creation, bool):
            is_admin_creation = False

        # --- Handle profile picture ---
        profile_pic_url = None
        if "profile_pic" in request.files:
            file = request.files["profile_pic"]
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
                filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
                file.save(filepath)
                profile_pic_url = f"/uploads/{filename}"  # URL for frontend

        if is_admin_creation:
            # Admin-created user: skip OTP
            user = User(
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=email,
                mobile_number=data.get("mobile_number"),
                profile_pic=profile_pic_url,
                role=data.get("role", "user")
            )
            user.set_password(data["password"])
            db.session.add(user)
            db.session.commit()
            access, refresh = create_tokens(user)
            return {"message": "User created by admin", "access": access, "refresh": refresh}, 201

        # Regular user registration with OTP
        otp = generate_otp()
        otp_store[email] = {
            "otp": otp,
            "data": data,
            "profile_pic": profile_pic_url,
            "expires": datetime.utcnow() + timedelta(minutes=10)
        }
        send_email(email, "GalvanAI OTP Verification", f"Your OTP: {otp}")
        return {"message": "OTP sent to email"}, 200

# --- Verify OTP Endpoint ---
@auth_ns.route("/verify-otp")
class VerifyOTP(Resource):
    def post(self):
        payload = request.json
        email = (payload.get("email") or "").lower()
        otp = payload.get("otp")
        record = otp_store.get(email)

        if not record:
            return {"message": "No OTP requested"}, 400
        if datetime.utcnow() > record["expires"]:
            del otp_store[email]
            return {"message": "OTP expired"}, 400
        if record["otp"] != otp:
            return {"message": "Invalid OTP"}, 400

        data = record["data"]
        user = User(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=email,
            mobile_number=data.get("mobile_number"),
            profile_pic=record.get("profile_pic"),
            role="user"
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        del otp_store[email]

        access, refresh = create_tokens(user)
        return {"message": "User created", "access": access, "refresh": refresh}, 201

# --- Login Endpoint ---
@auth_ns.route("/login")
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.json
        email = (data.get("email") or "").lower()
        password = data.get("password")

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {"message": "Invalid credentials"}, 401

        access, refresh = create_tokens(user)
        return {
            "access": access,
            "refresh": refresh,
            "role": user.role,
            "email": user.email
        }, 200

# --- Me Endpoint ---
@auth_ns.route("/me")
class Me(Resource):
    @token_required
    def get(self):
        user = request.current_user
        profile_pic_url = None
        if user.profile_pic:
            profile_pic_url = f"{request.host_url.rstrip('/')}{user.profile_pic}"
        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "mobile_number": user.mobile_number,
            "role": user.role,
            "profile_pic": profile_pic_url
        }

# --- Refresh Token Endpoint ---
@auth_ns.route("/refresh")
class Refresh(Resource):
    def post(self):
        payload = request.json
        token = payload.get("refresh")
        if not token:
            return {"message": "Missing refresh token"}, 400
        try:
            data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
            user = User.query.get(data["sub"])
            if not user:
                return {"message": "User not found"}, 404
            access, new_refresh = create_tokens(user)
            return {"access": access, "refresh": new_refresh}, 200
        except Exception as e:
            return {"message": "Invalid refresh token", "error": str(e)}, 401
