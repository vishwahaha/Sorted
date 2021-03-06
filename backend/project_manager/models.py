from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from djrichtextfield.models import RichTextField
from django.utils import timezone

# Create your models here.

class user(AbstractBaseUser):
    """
    full_name, display_picture, enrollment_number are provided by channel-i
    (Might use more details in the future)
    """
    user_id = models.IntegerField(primary_key = True, unique = True)
    full_name = models.CharField(max_length = 200)
    display_picture = models.URLField(
        default = None,
        null = True,
    )
    enrolment_number = models.IntegerField(default = 00000000)
    email = models.EmailField(null = True)

    USER_TYPES = [
        ('admin', 'admin'),
        ('normal', 'normal'),
    ]
    user_type = models.CharField(
        max_length = 6,
        choices = USER_TYPES,
        default = 'normal',
    )

    """
    Redundant here, but can be accessed by project_set, card_set and comment_set
    """
    #projects = models.ManyToManyField(project)
    #cards = models.ManyToManyField(cards)
    #comments = models.ManyToManyField(comment)
    
    """
    Projects, lists and cards created by the user can be accsessed by using 
    the related_name = project_creator, list_creator, card_creator respectively
    """
    #True -- user is online
    online_status = models.BooleanField(default = False)
    
    is_disabled = models.BooleanField(default = False)

    USERNAME_FIELD = 'user_id'

    def __str__(self):
        return f"This is {self.full_name}({self.enrolment_number})'s data"

class Settings(models.Model):

    user = models.OneToOneField(
        user,
        on_delete = models.CASCADE,
        primary_key = True,
    )

    #Dark mode
    dark_mode = models.BooleanField(default = False)

    #Email settings
    email_on_card_assignment = models.BooleanField(default = True)
    email_on_project_add = models.BooleanField(default = True)
    email_on_disable = models.BooleanField(default = True)


class project(models.Model):

    members = models.ManyToManyField(user)
    name = models.CharField(max_length = 100)
    wiki = RichTextField()

    creator = models.ForeignKey(
        user,
        primary_key = False,
        on_delete = models.DO_NOTHING,
        related_name = 'project_creator',
    )

    date_created = models.DateField(auto_now_add = True)

    #False = project is incomplete, True = project is finished
    finished_status = models.BooleanField(default = False)

    """
    Lists can be accessed by list_set
    """

    def __str__(self):
        return f"Project : {self.name}, created by : {self.creator.full_name}"

class list(models.Model):
    
    project = models.ForeignKey(
        project, 
        primary_key = False,
        on_delete = models.CASCADE,
    )

    title = models.CharField(max_length = 200)

    creator = models.ForeignKey(
        user,
        primary_key = False,
        on_delete = models.DO_NOTHING,
        related_name = 'list_creator'
    )

    time_stamp = models.DateTimeField(auto_now_add = True)

    #False = incomplete, True = complete
    finished_status = models.BooleanField(default = False)

    """
    Cards can be accessed by card_set
    """

    def __str__(self):
        return f"List id: {self.id}, in project: {self.project.name}"

class card(models.Model):

    list = models.ForeignKey(
        list, 
        primary_key = False,
        on_delete = models.CASCADE,
    )
    title = models.CharField(max_length = 100)
    desc = models.TextField(blank=True)

    creator = models.ForeignKey(
        user,
        primary_key = False,
        on_delete = models.DO_NOTHING,
        related_name = 'card_creator'
    )

    assignees = models.ManyToManyField(user)

    due_date = models.DateField(auto_now = False, auto_now_add = False,)

    #False = incomplete, True = complete
    finished_status = models.BooleanField(default = False)

    """
    Comments can be accessed by comment_set
    """
    
    def __str__(self):
        return f"Card in {self.list}"

class comment(models.Model):

    content = models.TextField()

    card = models.ForeignKey(
        card,
        primary_key = False,
        on_delete = models.CASCADE,
    )

    commentor = models.ForeignKey(
        user, 
        primary_key = False,
        on_delete = models.CASCADE,
        related_name = 'commented_cards',
    )

    timestamp = models.DateTimeField(default = timezone.now)

    is_edited = models.BooleanField(default = False)
    
    def __str__(self):
        return f"{self.content} *BY* {self.commentor.full_name}"