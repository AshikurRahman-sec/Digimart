"""Canonical backend permission service for identity and access checks."""

from __future__ import annotations

from typing import Protocol
from uuid import UUID

from app.core.exceptions import ForbiddenError
from app.core.permissions import ROLE_PERMISSIONS, Permission, Role


class PermissionUser(Protocol):
    id: UUID
    roles: list[str]
    is_active: bool


class PermissionService:
    def has_permission(self, user: PermissionUser, permission: Permission) -> bool:
        if not user.is_active:
            return False
        user_roles = {Role(role) for role in user.roles}
        return any(permission in ROLE_PERMISSIONS[role] for role in user_roles)

    def require_permission(self, user: PermissionUser, permission: Permission) -> None:
        if not self.has_permission(user, permission):
            raise ForbiddenError("You do not have permission to perform this action")

    def require_role(self, user: PermissionUser, role: Role) -> None:
        if not user.is_active or role.value not in user.roles:
            raise ForbiddenError(f"Role required: {role.value}")

    def require_product_owner(self, user: PermissionUser, product_id: UUID) -> None:
        if Role.ADMIN.value in user.roles:
            return
        self.require_permission(user, Permission.PRODUCT_UPDATE_OWN)
        raise ForbiddenError("Product ownership checks require the catalog service")

    def require_content_owner(self, user: PermissionUser, content_id: UUID) -> None:
        if Role.ADMIN.value in user.roles:
            return
        self.require_permission(user, Permission.CONTENT_READ_OWN)
        raise ForbiddenError("Content ownership checks require the content service")

    async def require_content_access(self, user: PermissionUser, content_id: UUID) -> None:
        if Role.ADMIN.value in user.roles:
            return
        self.require_permission(user, Permission.CONTENT_PLAYBACK)
        raise ForbiddenError("Content access checks require the entitlement service")


permission_service = PermissionService()

