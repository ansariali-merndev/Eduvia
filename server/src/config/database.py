from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from env import DB_URL


engine = create_engine(DB_URL, echo=True)
SessionLocal = sessionmaker(autoflush=False, bind=engine)
Base = declarative_base()