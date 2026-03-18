"""
JWT 认证模块
提供基于 JWT 的管理员身份验证功能
"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer Token 认证
security = HTTPBearer()


class AdminAuth:
    """管理员认证类"""

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """验证密码"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """获取密码哈希"""
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """创建访问令牌"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + settings.access_token_expires
        to_encode.update({"exp": expire, "sub": "admin"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> dict:
        """解码令牌"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭据",
                headers={"WWW-Authenticate": "Bearer"},
            )


async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    验证管理员身份

    从 Bearer Token 中解析并验证 JWT 令牌
    返回管理员用户名
    """
    token = credentials.credentials
    payload = AdminAuth.decode_token(token)

    # 验证令牌主题
    subject: str = payload.get("sub")
    if subject != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的管理员令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return subject


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    获取当前管理员信息

    返回包含管理员信息的字典
    """
    token = credentials.credentials
    payload = AdminAuth.decode_token(token)

    subject: str = payload.get("sub")
    if subject != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的管理员令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"username": "admin", "role": "administrator"}


# 导出认证工具类
admin_auth = AdminAuth()
