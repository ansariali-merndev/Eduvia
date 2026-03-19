from functools import wraps
from flask import jsonify

def handle_exception(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            return jsonify({
                "success": False,
                "message": str(e)
            }), 500

    return wrapper