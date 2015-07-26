from roomit.db import room

class RoomExistsException(Exception):
    pass
    

def generate_room(service, channel, name):
    if room.get_room(name):
        raise RoomExistsException()

    room.store_room(service, channel, name)

def get_room(room_name):
    data = room.get_room(room_name)
    return data
