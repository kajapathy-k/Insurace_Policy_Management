from sqlalchemy import Column, Integer, String, Boolean, Enum, Text, Date
from sqlalchemy.sql import func
from sqlalchemy import TIMESTAMP
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('admin', 'customer', 'agent'), default='customer')
    phone = Column(String(20))
    address = Column(Text)
    date_of_birth = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
