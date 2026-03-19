from app import bcrypt

def pw_hash(password):
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    return hashed_password

def check_pw(hashed_password, password):
    return bcrypt.check_password_hash(hashed_password, password)