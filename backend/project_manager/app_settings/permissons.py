from rest_framework.permissions import BasePermission, SAFE_METHODS
from .. import models

class IsCreatorOrAdminElseReadOnly(BasePermission):

    message = 'This action can only be performed by creator of object or an admin'

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user_obj = request.user

        if request.method in SAFE_METHODS:
            return True

        elif user_obj.user_type == 'admin':
            return True

        elif obj.creator == user_obj:
            return True
        
        else:
            return False

class IsDisabledThenReadOnly(BasePermission):

    message = 'Disabled user is not allowed to modify the database'

    def has_permission(self, request, view):
        user_obj = request.user

        if user_obj.is_disabled:
            if request.method in SAFE_METHODS:
                return True
            else:
                return False

        else:
            return True


    def has_object_permission(self, request, view, obj): 
        user_obj = request.user

        if request.method in SAFE_METHODS:
            return True

        elif user_obj.is_disabled:
            return False
        
        else:
            return True

class IsAdminElseReadOnly(BasePermission):

    message = 'Only admins have access to this'

    def has_permission(self, request, view):     
        user_obj = request.user 

        if request.method in SAFE_METHODS:
            return True

        elif user_obj.user_type == 'admin':
            return True

        else:
            return False
    
    def has_object_permission(self, request, view, obj):
        user_obj = request.user 

        if request.method in SAFE_METHODS:
            return True

        elif user_obj.user_type == 'admin':
            return True

        else:
            return False
        
class IsProjectMember(BasePermission):

    message = 'Only project members can perform this'

    def has_permission(self, request, view):
        user_obj = request.user
        project =   models.project.objects.get(id = view.kwargs.get('project_id', None))

        if user_obj.user_type == 'admin':
            return True

        elif user_obj in project.members.all():
            return True

        else:
            return False

class IsCommentor(BasePermission):

    message = 'Only the author of the comment can perform this action'

    def has_object_permission(self, request, view, obj):
        user_obj = request.user

        if obj.commentor == user_obj:
            return True
        
        else:
            return False

class ListPermsissons(BasePermission):

    message = 'You do not have permission for this action.'

    def has_object_permission(self, request, view, obj):
        user_obj = request.user

        allow = user_obj.user_type == 'admin' or user_obj.user_id == obj.creator.user_id or user_obj.user_id == obj.project.creator.user_id

        if allow:
            return True
        
        else:
            return False

class CardPermissons(BasePermission):

    message = 'You do not have permisson for this action.'

    def has_object_permission(self, request, view, obj):
        user_obj = request.user

        allow = user_obj.user_type == 'admin' or user_obj.user_id == obj.creator.user_id or user_obj.user_id == obj.list.project.creator.user_id

        if allow:
            return True
        
        else:
            return False