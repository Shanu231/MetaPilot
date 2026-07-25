from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Any, Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)

class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Token schemas
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # Access token expiry in seconds

class TokenRefresh(BaseModel):
    refresh_token: str

# Workspace schemas
class WorkspaceBase(BaseModel):
    name: str

class WorkspaceUpdate(BaseModel):
    settings: Dict[str, Any]

class WorkspaceResponse(WorkspaceBase):
    id: str
    owner_id: str
    settings: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# Notification schemas
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationMark(BaseModel):
    is_read: bool = True

# Profile Password Change schema
class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=128)

# System details schemas
class SystemHealth(BaseModel):
    status: str
    database: str
    redis: str

class SystemVersion(BaseModel):
    version: str
    project: str
    phase: int
