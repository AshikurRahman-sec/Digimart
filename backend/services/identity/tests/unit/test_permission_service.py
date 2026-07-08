from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID, uuid4

import pytest

from app.core.exceptions import ForbiddenError
from app.core.permissions import Permission, Role
from app.service_layer.permission_service import PermissionService


@dataclass
class UserStub:
    id: UUID
    roles: list[str]
    is_active: bool = True


def test_user_has_upload_permission() -> None:
    user = UserStub(id=uuid4(), roles=[Role.USER.value])

    assert PermissionService().has_permission(user, Permission.CONTENT_UPLOAD)


def test_user_lacks_admin_permission() -> None:
    user = UserStub(id=uuid4(), roles=[Role.USER.value])

    with pytest.raises(ForbiddenError):
        PermissionService().require_permission(user, Permission.ADMIN_DASHBOARD)


def test_inactive_admin_is_denied() -> None:
    user = UserStub(id=uuid4(), roles=[Role.ADMIN.value], is_active=False)

    assert not PermissionService().has_permission(user, Permission.ADMIN_DASHBOARD)

