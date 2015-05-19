import uuid

from roomit.db import room

def generate_room(link):
    room_uuid = str(uuid.uuid4())
    room.store_room(link, room_uuid)

    return room_uuid
