from flask import request, make_response
from app.models import Users
from app import db
from env import FLASK_ENV
from sqlalchemy import select
from app.config import send_mail
from app.utils import (
    success_res, error_res,
    pw_hash, check_pw,
    encode_token, decode_token
)
import random
from datetime import datetime, timezone, timedelta


IS_PROD = FLASK_ENV == "production"

def _get_user_by_email(email: str) -> Users:
    stmt = select(Users).where(Users.email == email)
    return db.session.execute(stmt).scalar_one_or_none()

def _set_otp(user: Users) -> str:
    otp = str(random.randint(100000, 999999))
    user.otp = otp
    user.otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    return otp

def _is_otp_valid(user: Users, otp: str) -> bool:
    if not user.otp or not user.otp_expiry:
        return False
    if user.otp != otp:
        return False
    expiry = user.otp_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) <= expiry

def _clear_otp(user: Users):
    user.otp        = None
    user.otp_expiry = None
    db.session.commit()
    return

def _user_data(user: Users, full: bool = False) -> dict:
    base = {
        "id":          user.id,
        "first_name":  user.first_name,
        "last_name":   user.last_name,
        "email":       user.email,
        "profile_img": user.profile_img,
        "is_verified": user.is_verified,
    }
    if full:
        base["last_login"] = (
            user.last_login.isoformat() + "Z" if user.last_login else None
        )
        base["created_at"] = user.created_at.isoformat() + "Z"
    return base

def _set_token_cookie(response, token: str):
    response.set_cookie(
        "token",
        token,
        httponly = True,
        secure   = IS_PROD,
        samesite = "None" if IS_PROD else "Lax",
        max_age  = 60 * 60 * 24 * 7,
        path     = "/",
    )
    return response

def _clear_token_cookie(response):
    response.delete_cookie(
        "token",
        httponly = True,
        secure   = IS_PROD,
        samesite = "None" if IS_PROD else "Lax",
        path     = "/",
    )
    return response



def reset_password_func():
    data         = request.get_json()
    reset_token  = (data.get("reset_token")     or "").strip()
    new_password = (data.get("new_password")     or "")
    confirm_pass = (data.get("confirm_password") or "")
 
    if not all([reset_token, new_password, confirm_pass]):
        return error_res("All fields are required.", 400)
 
    if new_password != confirm_pass:
        return error_res("Passwords do not match.", 400)
 
    if len(new_password) < 8:
        return error_res("Password must be at least 8 characters.", 400)
 
    payload = decode_token(reset_token)
    if not payload or not payload.get("user", {}).get("reset"):
        return error_res("Invalid or expired reset token.", 400)
 
    user = db.session.get(Users, payload["user"]["id"])
    if not user:
        return error_res("User not found.", 404)
 
    user.password   = pw_hash(new_password)
    user.updated_at = datetime.now(timezone.utc)
    db.session.commit()
 
    return success_res("Password reset successfully. Please log in.")


def verify_forgot_otp_func():
    data  = request.get_json()
    email = (data.get("email") or "").strip().lower()
    otp   = (data.get("otp")   or "").strip()
 
    if not email or not otp:
        return error_res("Email and OTP are required.", 400)
 
    user = _get_user_by_email(email)
    if not user:
        return error_res("User not found.", 404)
 
    if not _is_otp_valid(user, otp):
        return error_res("Invalid or expired OTP.", 400)
 
    _clear_otp(user)
 
    reset_token = encode_token({"id": user.id, "email": user.email, "reset": True}, minutes=15)
    return success_res("OTP verified successfully.", reset_token=reset_token)


def forgot_password_func():
    data  = request.get_json()
    email = (data.get("email") or "").strip().lower()
 
    if not email:
        return error_res("Email is required.", 400)
 
    user = _get_user_by_email(email)
 
    if not user:
        return success_res("If this email register, an OTP has been sent.")
 
    otp = _set_otp(user)
    db.session.commit()
    send_mail(email, user.first_name, otp, "Reset your Eduvia password")
 
    return success_res("OTP sent to your email. Valid for 10 minutes.")


def change_password_func():
    data         = request.get_json()
    token        = request.cookies.get("token", "")
    old_password = (data.get("old_password")     or "")
    new_password = (data.get("new_password")      or "")
    confirm_pass = (data.get("confirm_password")  or "")
 
    if not all([old_password, new_password, confirm_pass]):
        return error_res("All fields are required.", 400)
 
    payload = decode_token(token)
    if not payload:
        return error_res("Unauthorized. Invalid or expired token.", 401)
 
    user = db.session.get(Users, payload["user"]["id"])
    if not user:
        return error_res("User not found.", 404)
 
    if not check_pw(user.password, old_password):
        return error_res("Current password is incorrect.", 401)
 
    if new_password != confirm_pass:
        return error_res("New passwords do not match.", 400)
 
    if len(new_password) < 8:
        return error_res("Password must be at least 8 characters.", 400)
 
    user.password   = pw_hash(new_password)
    user.updated_at = datetime.now(timezone.utc)
    db.session.commit()
 
    return success_res("Password changed successfully.")


def me_func():
    token = request.cookies.get("token", "")
 
    payload = decode_token(token)
    if not payload:
        return error_res("Unauthorized. Invalid or expired token.", 401)
 
    user = db.session.get(Users, payload["user"]["id"])
    if not user:
        return error_res("User not found.", 404)
 
    return success_res("User fetched.", user=_user_data(user, full=True))


def logout_func():
    response = make_response(success_res("Logged out successfully."))
    return _clear_token_cookie(response)


def login_func():
    data     = request.get_json()
    email    = data.get("email")
    password = data.get("password")
 
    if not email or not password:
        return error_res("Email and password are required.", 400)
 
    user = _get_user_by_email(email)
 
    if not user or not check_pw(user.password, password):
        return error_res("Invalid email or password.", 401)
 
    if not user.is_verified:
        return error_res("Please verify your email first.", 403)
 
    user.last_login = datetime.now(timezone.utc)
    db.session.commit()
 
    token    = encode_token({"id": user.id, "email": user.email})
    response = make_response(success_res("Logged in successfully.", user=_user_data(user, full=True)))
    return _set_token_cookie(response, token)


def resend_otp_func():
    data  = request.get_json()
    email = data.get("email")
 
    if not email:
        return error_res("Email is required.", 400)
 
    user = _get_user_by_email(email)
    if not user:
        return error_res("User not found.", 404)
 
    if user.is_verified:
        return error_res("Account already verified.", 400)
 
    otp = _set_otp(user)
    db.session.commit()
    send_mail(email, user.first_name, otp, "Your new Eduvia OTP")
 
    return success_res("OTP resent. Valid for 10 minutes.")


def verify_otp_func():
    data  = request.get_json()
    email = data.get("email")
    otp   = data.get("otp")
 
    if not email or not otp:
        return error_res("Email and OTP are required.", 400)
 
    user = _get_user_by_email(email)
    if not user:
        return error_res("User not found.", 404)
 
    if user.is_verified:
        return error_res("Account already verified.", 400)
 
    if not _is_otp_valid(user, otp):
        return error_res("Invalid or expired OTP.", 400)
 
    user.is_verified = True
    user.last_login = datetime.now(timezone.utc)
    _clear_otp(user)
 
    token    = encode_token({"id": user.id, "email": user.email})
    response = make_response(success_res("Email verified successfully.", user=_user_data(user, full=True)))
    return _set_token_cookie(response, token)


def register_func():
    data = request.get_json()
    
    first_name = data.get("firstname")
    last_name = data.get("lastname")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if not all([first_name, last_name, email, password, confirm_password]):
        return error_res("Required field is empty", 400)
    
    if password != confirm_password:
        return error_res("Passwords do not match.", 400)

    if len(password) < 8:
        return error_res("Password must contain at least 8 characters.", 400)

    user = _get_user_by_email(email)

    if user:
        if user.is_verified:
            return error_res("Email already registered, Please login to continue", 400)    
    else:
        user = Users(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=pw_hash(password),
            profile_img=f"https://ui-avatars.com/api/?name={first_name}+{last_name}&background=0D6EFD&color=fff"
        )
        db.session.add(user)
        
    otp = _set_otp(user)
    send_mail(email, first_name, otp, "Your OTP for Email Verification")
    db.session.commit()

    return success_res(
        "User registered successfully. Please verify OTP sent to email.",
        email=email
    )
    
    
    