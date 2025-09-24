from extensions import db
from datetime import datetime
from passlib.hash import bcrypt

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    profile_pic = db.Column(db.String, nullable=True)  # store filename or URL
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    mobile_number = db.Column(db.String(50), nullable=True)
    role = db.Column(db.String(20), default="user")  # 'superadmin' or 'user'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, pw):
        self.password_hash = bcrypt.hash(pw)

    def check_password(self, pw):
        return bcrypt.verify(pw, self.password_hash)
