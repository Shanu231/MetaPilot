from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.db import get_db
from app.dependencies.auth_dep import get_current_user
from app.core.security import hash_password, verify_password
from app.models.models import User, Workspace, Notification, AuditLog
from app.schemas.schemas import (
    UserResponse,
    PasswordChange,
    WorkspaceResponse,
    WorkspaceUpdate,
    NotificationResponse,
    NotificationMark
)

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/me/password", status_code=status.HTTP_200_OK)
async def change_password(
    body: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(body.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Original password does not match database record."
        )

    current_user.hashed_password = hash_password(body.new_password)
    
    # Audit action
    audit = AuditLog(
        user_id=current_user.id,
        action="password_change",
        target=current_user.email
    )
    db.add(audit)
    await db.commit()

    return {"detail": "Password successfully updated."}

@router.get("/me/workspace", response_model=WorkspaceResponse)
async def get_my_workspace(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Workspace).where(Workspace.owner_id == current_user.id))
    workspace = result.scalars().first()
    if not workspace:
        # Fallback: create workspace if not exists
        workspace = Workspace(
            name=f"{current_user.name}'s Workspace",
            owner_id=current_user.id,
            settings={"theme": "dark", "sidebarCollapsed": False}
        )
        db.add(workspace)
        await db.commit()

    return workspace

@router.put("/me/workspace", response_model=WorkspaceResponse)
async def update_my_workspace(
    body: WorkspaceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Workspace).where(Workspace.owner_id == current_user.id))
    workspace = result.scalars().first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found."
        )

    workspace.settings = body.settings
    await db.commit()
    return workspace

@router.get("/me/notifications", response_model=List[NotificationResponse])
async def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch user's notifications sorted by date descending
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    )
    notifications = result.scalars().all()
    
    # If no notifications exist, seed 3 mock notifications to demonstrate functionality
    if len(notifications) == 0:
        n1 = Notification(user_id=current_user.id, title="DBT run succeeded", message="dbt_incremental_transform finished successfully.", type="success")
        n2 = Notification(user_id=current_user.id, title="Ingestion degraded", message="stripe_webhook_events table experienced latency.", type="warn")
        n3 = Notification(user_id=current_user.id, title="New catalog sync", message="DataHub synced 42 new Postgres objects.", type="info", is_read=True)
        db.add_all([n1, n2, n3])
        await db.commit()
        
        result = await db.execute(
            select(Notification)
            .where(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
        )
        notifications = result.scalars().all()

    return notifications

@router.put("/me/notifications/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: str,
    body: NotificationMark,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalars().first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    notification.is_read = body.is_read
    await db.commit()
    return notification
