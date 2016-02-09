import json
import uuid

from mysql.connector import IntegrityError
from roomit.db import room


def follow_channels(user_id, platform, channels):
    if not isinstance(channels, list):
        channels = [channels]
        
    room.follow_channels(user_id, platform, channels)


def follow_channels_by_ids(user_id, channels):
    if not isinstance(channels, list):
        channels = [channels]

    room.follow_channels_by_ids(user_id, channels)


def create_room(user_id, room_name):
    try:
        return room.create_room(user_id, room_name)
    except IntegrityError as err:
        room_name = str(uuid.uuid4())
        return room.create_room(user_id, room_name)


def get_room_owner(room_name):
    return room.get_room_owner(room_name)


def get_user_room(user_id):
    return room.get_user_room(user_id)


def get_user_streams(user_id):
    return room.get_user_streams(user_id)