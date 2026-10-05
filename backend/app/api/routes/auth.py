import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.connection import get_db
from app.models import User
from app.schemas.auth import LoginRequest, SignupRequest


router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        120_000,
    )
    return salt.hex() + "$" + digest.hex()


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, digest_hex = stored_hash.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except (ValueError, TypeError):
        return False

    actual = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        120_000,
    )
    return secrets.compare_digest(actual, expected)


@router.post("/signup", status_code=201)
async def signup(data: SignupRequest, db: AsyncSession = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    username = data.username.strip()
    email = str(data.email).strip().lower()

    existing = await db.execute(
        select(User).where(
            (User.username == username) | (User.email == email)
        )
    )
    user = existing.scalar_one_or_none()

    if user:
        if user.username.lower() == username.lower():
            raise HTTPException(status_code=409, detail="Username is already in use")
        raise HTTPException(status_code=409, detail="Email is already registered")

    new_user = User(
        full_name=data.full_name.strip(),
        username=username,
        email=email,
        password_hash=hash_password(data.password),
        role="user",
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "success": True,
        "message": "Account created successfully",
        "username": new_user.username,
        "role": new_user.role,
    }


@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.username == data.username.strip())
    )
    user = result.scalar_one_or_none()

    if user and verify_password(data.password, user.password_hash):
        return {
            "success": True,
            "message": "Login successful",
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "token": "wina-bwangu-session",
        }

    if (
        data.username.strip() == settings.admin_username
        and data.password == settings.admin_password
    ):
        return {
            "success": True,
            "message": "Login successful",
            "username": settings.admin_username,
            "full_name": "Administrator",
            "role": "admin",
            "token": "wina-bwangu-session",
        }

    raise HTTPException(status_code=401, detail="Invalid username or password")
