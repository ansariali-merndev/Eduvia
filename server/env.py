from dotenv import load_dotenv
from os import getenv

load_dotenv()

DATABASE_URI = getenv("DATABASE_URI")
GMAIL_USER = getenv("GMAIL_USER")
GMAIL_PASS = getenv("GMAIL_PASS")
SECRET_KEY = getenv("SECRET_KEY")
FLASK_ENV = getenv("FLASK_ENV")
FRONTED_URI = getenv("FRONTED_URI")
GEMINI_API_KEY = getenv("GEMINI_API_KEY")
RESEND_API_KEY = getenv("RESEND_API_KEY")
SMTP_KEY = getenv("SMTP_KEY")