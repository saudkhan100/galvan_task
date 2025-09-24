from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_restx import Api
from config import Config
from extensions import db
from models import User
from auth import auth_ns
from admin import admin_ns
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    # --- CORS ---
    CORS(app, resources={
        r"/api/*": {"origins": ["http://localhost:3000", "http://192.168.148.2:3000"]},
        r"/uploads/*": {"origins": ["http://localhost:3000", "http://192.168.148.2:3000"]}
    }, supports_credentials=True)
    # --- API ---
    api = Api(app, title="GalvanAI FullStack Task API", doc="/docs")
    api.add_namespace(auth_ns, path="/api/auth")
    api.add_namespace(admin_ns, path="/api/admin")

    # --- DB initialization and superadmin creation ---
    with app.app_context():
        db.create_all()
        sa_email = "superadmin@example.com"
        sa_password = "superstrongpassword"
        if not User.query.filter_by(email=sa_email.lower()).first():
            sa = User(
                first_name="Super",
                last_name="Admin",
                email=sa_email.lower(),
                role="superadmin"
            )
            sa.set_password(sa_password)
            db.session.add(sa)
            db.session.commit()
            print(f"[INIT] Superadmin created: {sa_email}")
        else:
            print(f"[INIT] Superadmin already exists: {sa_email}")

    # --- Serve uploaded images ---
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(os.path.join(app.root_path, 'uploads'), filename)

    return app

if __name__ == "__main__":
    os.makedirs("uploads", exist_ok=True)
    app = create_app()
    app.run(port=5000, debug=True)

