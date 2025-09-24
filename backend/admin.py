import os
from flask_restx import Namespace, Resource, fields
from models import User
from extensions import db
from auth import token_required
from flask import request
from werkzeug.utils import secure_filename
from config import Config, allowed_file

# --- Namespace ---
admin_ns = Namespace("admin", description="Admin user management")

# --- User Model for Output ---
user_model = admin_ns.model("User", {
    "id": fields.Integer(),
    "first_name": fields.String(),
    "last_name": fields.String(),
    "email": fields.String(),
    "mobile_number": fields.String(),
    "role": fields.String(),
    "profile_pic": fields.String()
})

# --- Admin Access Decorator ---
def admin_required(f):
    def wrapper(*args, **kwargs):
        user = getattr(request, "current_user", None)
        if not user:
            return {"message": "Unauthorized"}, 401

        # Allow both superadmin and admin
        if user.role not in ["superadmin", "admin"]:
            return {"message": "Admin access required"}, 403

        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# --- List and Create Users ---
@admin_ns.route("/users")
class UsersList(Resource):
    @token_required
    @admin_required
    @admin_ns.marshal_list_with(user_model)
    def get(self):
        users = User.query.all()
        return [
            {
                "id": u.id,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "email": u.email,
                "mobile_number": u.mobile_number,
                "role": u.role,
                "profile_pic": u.profile_pic
            } for u in users
        ]

    @token_required
    @admin_required
    def post(self):
        try:
            # Handle form data
            data = request.form.to_dict() if request.form else request.json
            if User.query.filter_by(email=data["email"]).first():
                return {"message": "Email exists"}, 400

            profile_pic_url = None
            if "profile_pic" in request.files:
                file = request.files["profile_pic"]
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
                    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
                    file.save(filepath)
                    profile_pic_url = f"/uploads/{filename}"

            user = User(
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                mobile_number=data.get("mobile_number"),
                role=data.get("role", "user"),
                profile_pic=profile_pic_url
            )
            user.set_password(data["password"])
            db.session.add(user)
            db.session.commit()
            return {"message": "User created"}, 201
        except Exception as e:
            return {"message": "Failed to create user", "error": str(e)}, 500

# --- Get, Update, Delete User ---
@admin_ns.route("/users/<int:user_id>")
class UserDetail(Resource):
    @token_required
    @admin_required
    @admin_ns.marshal_with(user_model)
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "mobile_number": user.mobile_number,
            "role": user.role,
            "profile_pic": user.profile_pic
        }

    @token_required
    @admin_required
    def put(self, user_id):
        try:
            user = User.query.get_or_404(user_id)
            data = request.form.to_dict() if request.form else request.json or {}

            # Update fields
            user.first_name = data.get("first_name", user.first_name)
            user.last_name = data.get("last_name", user.last_name)
            user.mobile_number = data.get("mobile_number", user.mobile_number)
            user.role = data.get("role", user.role)
            if data.get("password"):
                user.set_password(data.get("password"))

            # Handle profile pic
            if "profile_pic" in request.files:
                file = request.files["profile_pic"]
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
                    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
                    file.save(filepath)
                    user.profile_pic = f"/uploads/{filename}"

            db.session.commit()
            return {"message": "User updated"}, 200
        except Exception as e:
            return {"message": "Failed to update user", "error": str(e)}, 500

    @token_required
    @admin_required
    def delete(self, user_id):
        try:
            user = User.query.get_or_404(user_id)
            db.session.delete(user)
            db.session.commit()
            return {"message": "User deleted"}, 200
        except Exception as e:
            return {"message": "Failed to delete user", "error": str(e)}, 500
