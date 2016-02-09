import re
import uuid

from roomit import utils
from roomit.handlers import room

from django.conf import settings


def create_room(user_id, name):
    return room.create_room(user_id, name)


def get_user_room(user_id):
    return room.get_user_room(user_id)


def get_room_owner(room_name):
    return room.get_room_owner(room_name)
    

def add_stream(user_id, params):
    stream_id = params.get('stream_id')
    if not stream_id:
        return utils.validation_error('stream_id')

    stream_id = int(stream_id)
    room.follow_channels_by_ids(user_id, stream_id)


def delete_stream(params):
    pass


def get_user_streams(user_id):
    return room.get_user_streams(user_id)