from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
from src.config.database import SessionLocal, engine, Base
from src.model.users import User
from src.schemas.users import UserSchema

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    content = {
        "success": True,
        "message": "Welcome back to the FASTAPI application"
    }
    return JSONResponse(
        status_code=200,
        content=content
    )


@app.get("/create-users")
def create_users(db: Session = Depends(get_db)):
    users_data = [
        {"name": "Ali Ansari"},
        {"name": "Sara Khan"},
        {"name": "John Doe"}
    ]
    created_users = []
    for u in users_data:
        user = User(name=u["name"])
        db.add(user)
        db.commit()
        db.refresh(user)
        created_users.append(user)
    
    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "message": "3 users created",
            "users": [UserSchema.from_orm(u).dict() for u in created_users]
        }
    )

@app.get("/users", response_model=List[UserSchema])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
