import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "devsecret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwtdev")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///data.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = int(os.getenv("SMTP_PORT") or 0)
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    EMAIL_FROM = os.getenv("EMAIL_FROM", "no-reply@example.com")

    SUPERADMIN_EMAIL = os.getenv("SUPERADMIN_EMAIL", "superadmin@example.com")
    SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD", "superpassword")

    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


# Function to check allowed file extensions
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS
