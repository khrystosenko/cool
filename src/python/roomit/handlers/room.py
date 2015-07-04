from roomit.db import room

def generate_room(service, channel):
    data = room.store_room(service, channel)
    return data

def get_room(room_uuid):
    data = room.get_room(room_uuid)
    return data
