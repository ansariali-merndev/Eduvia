from flask import jsonify

def success_res(msg, **kwargs):
    return jsonify({
        "success": True,
        "message": msg,
        **kwargs
    }), 200


def error_res(msg, status_code):
    return jsonify({
        "success": False,
        "message": msg
    }), status_code

