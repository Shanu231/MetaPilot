from datetime import datetime, timedelta, UTC
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.db import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token
)
from app.models.models import User, Workspace, UserSession, AuditLog
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, TokenRefresh

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )

    # Determine first user role (Admin for first user, Developer for subsequent ones)
    total_users_result = await db.execute(select(User))
    has_users = len(total_users_result.scalars().all()) > 0
    role = "Developer" if has_users else "Admin"

    # Create new user
    new_user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        name=body.name,
        role=role
    )
    db.add(new_user)
    await db.flush()  # Extract user id

    # Create default workspace
    new_workspace = Workspace(
        name=f"{body.name}'s Workspace",
        owner_id=new_user.id,
        settings={"theme": "dark", "sidebarCollapsed": False, "notifications": {"onSuccess": True, "onWarn": True}}
    )
    db.add(new_workspace)

    # Issue Tokens
    access_token = create_access_token(new_user.id, new_user.role)
    refresh_token = create_refresh_token(new_user.id)

    # Save Session
    new_session = UserSession(
        user_id=new_user.id,
        refresh_token=refresh_token,
        expires_at=datetime.now(UTC) + timedelta(days=7)
    )
    db.add(new_session)

    # Log action
    audit = AuditLog(
        user_id=new_user.id,
        action="register",
        target=body.email
    )
    db.add(audit)

    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60
    )

@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalars().first()

    if not user or not verify_password(body.password, user.hashed_password):
        # Log failed login attempt anonymously
        audit = AuditLog(
            action="login_failed",
            target=body.email
        )
        db.add(audit)
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password combination.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated."
        )

    # Issue Tokens
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    # Save Session
    new_session = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.now(UTC) + timedelta(days=7)
    )
    db.add(new_session)

    # Log action
    audit = AuditLog(
        user_id=user.id,
        action="login",
        target=body.email
    )
    db.add(audit)

    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: TokenRefresh, db: AsyncSession = Depends(get_db)):
    payload = verify_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    user_id = payload.get("sub")
    
    # Verify session in database
    session_result = await db.execute(
        select(UserSession).where(
            UserSession.user_id == user_id,
            UserSession.refresh_token == body.refresh_token
        )
    )
    session = session_result.scalars().first()
    if not session or session.expires_at.replace(tzinfo=UTC) < datetime.now(UTC):
        if session:
            await db.delete(session)
            await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired or is revoked."
        )

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated or missing."
        )

    # Cycle Tokens (Issue new access + cycles refresh token)
    new_access_token = create_access_token(user.id, user.role)
    new_refresh_token = create_refresh_token(user.id)

    session.refresh_token = new_refresh_token
    session.expires_at = datetime.now(UTC) + timedelta(days=7)
    await db.commit()

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=30 * 60
    )

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(body: TokenRefresh, db: AsyncSession = Depends(get_db)):
    # Find session
    session_result = await db.execute(
        select(UserSession).where(UserSession.refresh_token == body.refresh_token)
    )
    session = session_result.scalars().first()
    if session:
        # Audit action
        audit = AuditLog(
            user_id=session.user_id,
            action="logout",
            target=session.user_id
        )
        db.add(audit)

        await db.delete(session)
        await db.commit()

    return {"detail": "Successfully logged out."}
