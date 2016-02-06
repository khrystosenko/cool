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


def get_user_streams(user_id, room_name):
    room_owner_id = room.get_room(room_name) if room_name else user_id
    data = {
        'owner': json.dumps(room_owner_id == user_id),
        'streams': json.dumps(room.get_user_streams(room_owner_id))
    }

    return data