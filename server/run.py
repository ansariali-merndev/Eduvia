from flask import Flask
from flask_cors import CORS
from app.utils import success_res
from app.routes import auth_bp, api_bp
from env import DATABASE_URI, SMTP_KEY, FRONTED_URI, FLASK_ENV
from app import db, mail, bcrypt

is_prod = FLASK_ENV == "production"

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URI
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["MAIL_SERVER"] = "smtp-relay.brevo.com"
    app.config["MAIL_PORT"] = 587
    app.config["MAIL_USE_TLS"] = True
    app.config["MAIL_USE_SSL"] = False
    app.config["MAIL_USERNAME"] = "a57493001@smtp-brevo.com"
    app.config["MAIL_PASSWORD"] = SMTP_KEY
    app.config["MAIL_DEFAULT_SENDER"] = "ansariali.developer@gmail.com"

    db.init_app(app)
    mail.init_app(app)
    bcrypt.init_app(app)
    CORS(app, origins=[FRONTED_URI], supports_credentials=True)

    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)

    @app.route("/")
    def root():
        return success_res("Welcome back Eduvia API")

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(port=3000, host="0.0.0.0", debug=True)