from rest_framework import permissions

class IsCheckpointOfficer(permissions.BasePermission):
    """Доступ только для охраны КПП"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_checkpoint_officer)

class IsCarpetAdmin(permissions.BasePermission):
    """Доступ только для администратора ковров"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_carpet_admin)

class IsDormManager(permissions.BasePermission):
    """Доступ только для менеджера общежития"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_dorm_manager)