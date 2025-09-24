import random
import smtplib
from email.message import EmailMessage
from config import Config

def generate_otp():
    return str(random.randint(100000, 999999))

def send_email(to_email, subject, otp):
    if Config.SMTP_HOST and Config.SMTP_PORT and Config.SMTP_USER and Config.SMTP_PASSWORD:
        try:
            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = Config.EMAIL_FROM
            msg["To"] = to_email

            # HTML content
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; text-align: center;">
                    <h2 style="color: #333;">Welcome to GalvanAI!</h2>
                    <p>Hi there,</p>
                    <p>Thank you for registering. Please use the OTP below to complete your registration:</p>
                    <h1 style="color: #1a73e8;">{otp}</h1>
                    <p style="font-size: 14px; color: #555;">This OTP is valid for 10 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #999;">If you did not register, please ignore this email.</p>
                </div>
            </body>
            </html>
            """

            msg.add_alternative(html_content, subtype='html')

            with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as smtp:
                smtp.starttls()
                smtp.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
                smtp.send_message(msg)
            print(f"Email sent to {to_email}")
        except Exception as e:
            print(f"Failed to send email: {e}")
            print(f"[EMAIL FALLBACK] To: {to_email}\nSubject: {subject}\n\nYour OTP: {otp}")

