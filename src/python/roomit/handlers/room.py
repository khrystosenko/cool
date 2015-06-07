import uuid

from roomit.db import room

def generate_room(service, channel):
    room_uuid = str(uuid.uuid4())
    room.store_room(service, channel, room_uuid)

    return room_uuid

def get_room(room_uuid):
    data = room.get_room(room_uuid)
    return data
