import re
import uuid

from roomit import utils
from roomit.handlers import room

from django.conf import settings


def generate_room(params):
    link = params.get('link', '')
    if not link:
        return utils.validation_error('link', field='link')

    service = None
    channel = None
    for item in settings.REGEXP['link']:
    	match = re.match(item['pattern'], link)
    	if match:
    		service = item['service']
    		channel = match.group(5)

    if not service:
    	return {'error': 'Unknown service.', 'field': 'link'}

    if not channel:
    	return {'error': 'Unknown channel.', 'field': 'link'}

    name = params.get('name', '')
    if name and not utils.validate_regexp('room_name', name):
        return utils.validation_error('name')
    
    if not name:
        name = str(uuid.uuid4())

    name = name.lower()

    try:
        room.generate_room(service, channel, name)
    except room.RoomExistsException:
        return utils.validation_error('name')

    return {'name': name}

def get_room(room_name):
    data = room.get_room(room_name)
    return data
