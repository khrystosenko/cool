import re

from roomit import utils
from roomit.handlers import room

from django.conf import settings


def generate_room(params):
    link = params.get('link', '')
    if not link:
    	return utils.validation_error('link')

    service = None
    channel = None
    for item in settings.REGEXP['link']:
    	match = re.match(item['pattern'], link)
    	if match:
    		service = item['service']
    		channel = match.group(5)

    if not service:
    	return {'error': 'Unknown service.'}

    if not channel:
    	return {'error': 'Unknown channel.'}

    return {'room_uuid': room.generate_room(service, channel)}

def get_room(room_uuid):
    data = room.get_room(room_uuid)
    return data
