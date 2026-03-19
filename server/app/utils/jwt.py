from env import SECRET_KEY
import jwt
from datetime import datetime, timedelta, timezone


def encode_token(payload: dict, minutes: int = None, days: int = 7) -> str:
    data = {
        "user": payload,
        "exp": datetime.now(timezone.utc) + (
            timedelta(minutes=minutes) if minutes else timedelta(days=days)
        ),
    }
    return jwt.encode(data, SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None