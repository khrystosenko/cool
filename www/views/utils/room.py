import re
import uuid

from roomit import utils
from roomit.handlers import room

from django.conf import settings


def generate_room(params):
    pass

def get_room(room_name):
    data = room.get_room(room_name)
    return data
