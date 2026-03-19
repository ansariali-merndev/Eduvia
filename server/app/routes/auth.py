from flask import Blueprint
from app.utils import success_res, handle_exception
from app.controllers import (
    register_func, verify_otp_func, resend_otp_func,
    login_func, logout_func, me_func, change_password_func,
    forgot_password_func, reset_password_func,
    verify_forgot_otp_func
)


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/")
@handle_exception
def root():
    return success_res("Welcome Eduvia auth API")

@auth_bp.patch("/reset-password")
@handle_exception
def reset_password():
    return reset_password_func()

@auth_bp.patch("/verify-forgot-otp")
@handle_exception
def verify_forgot_otp():
    return verify_forgot_otp_func()

@auth_bp.patch("/forgot-password")
@handle_exception
def forgot_password():
    return forgot_password_func()

@auth_bp.put("/change-password")
@handle_exception
def change_password():
    return change_password_func()

@auth_bp.get("/me")
@handle_exception
def me():
    return me_func()

@auth_bp.post("/logout")
@handle_exception
def logout():
    return logout_func()

@auth_bp.post("/login")
@handle_exception
def login():
    return login_func()

@auth_bp.post("/resend-otp")
@handle_exception
def resend_otp():
    return resend_otp_func()

@auth_bp.post("/verify-otp")
@handle_exception
def verify_otp():
    return verify_otp_func()

@auth_bp.post("/register")
@handle_exception
def register():
    return register_func()    

