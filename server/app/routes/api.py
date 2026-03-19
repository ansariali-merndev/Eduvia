from flask import Blueprint
from app.utils import success_res, handle_exception
from app.controllers import (
    generate_plan_func, get_tasks_func,
    get_subject_tasks_func, update_task_status_func,
    get_dashboard_func,
)

api_bp = Blueprint("api_bp", __name__, url_prefix="/api")

@api_bp.route("/")
@handle_exception
def root():
    return success_res("Eduvia private api starts here")

@api_bp.post("/generate-plan")
@handle_exception
def generate_plan():
    return generate_plan_func()

@api_bp.post("/tasks")
@handle_exception
def get_tasks():
    return get_tasks_func()

@api_bp.post("/tasks/subject")
@handle_exception
def get_subject_tasks():
    return get_subject_tasks_func()

@api_bp.patch("/tasks/<int:task_id>/status")
@handle_exception
def update_task_status(task_id):
    return update_task_status_func(task_id)

@api_bp.post("/dashboard")
@handle_exception
def get_dashboard():
    return get_dashboard_func()