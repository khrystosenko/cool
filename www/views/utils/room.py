from roomit.handlers import room


def generate_room(params):
    link = params.get('link')
    return room.generate_room(link)
