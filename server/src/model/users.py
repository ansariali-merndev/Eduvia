from sqlalchemy import Integer, Column, String, Boolean
from src.config.database import Base

class User(Base):
    
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)