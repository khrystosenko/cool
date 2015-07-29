import json
import requests

# This script will probably fail locally because we are using 
# same MCU server for both test and production environments.
#
# Uncomment to run locally
# import sys, os
# sys.path.insert(1, os.getcwd() + '\\..\\..')
# sys.path.insert(1, os.getcwd() + '\\..\\..\\..\\..\\www')
# os.environ["DJANGO_SETTINGS_MODULE"] = "settings"


from roomit.handlers import rooms_history

HEADERS = {
	'Content-Type': 'application/json'
}

TRANSACTION = 'room_participants_cron'

SESSION_URL = 'http://185.65.245.105:8088/janus'
SESSION_PAYLOAD = json.dumps({
	'janus': 'create',
	'transaction': TRANSACTION
})

SENDER_URL = 'http://185.65.245.105:8088/janus/{session_id}'
SENDER_PAYLOAD = json.dumps({
	'janus': 'attach',
	'plugin' :'janus.plugin.videoroom',
	'transaction': TRANSACTION
})

LIST_ROOMS_URL = 'http://185.65.245.105:8088/janus/{session_id}/{sender_id}'
LIST_ROOMS_PAYLOAD = json.dumps({
	'janus': 'message',
	'body': {
		'request': 'list'
	},
	'transaction': TRANSACTION
})



def __initialize_session():
	response = requests.post(SESSION_URL, data=SESSION_PAYLOAD, headers=HEADERS)
	data = json.loads(response.content)

	return data['data']['id']

def __initialize_sender(session_id):
	response = requests.post(SENDER_URL.format(session_id=session_id), 
							  data=SENDER_PAYLOAD, headers=HEADERS)
	data = json.loads(response.content)

	return data['data']['id']

def __get_rooms_list(session_id, sender_id):
	response = requests.post(LIST_ROOMS_URL.format(session_id=session_id, sender_id=sender_id),
							 LIST_ROOMS_PAYLOAD)
	data = json.loads(response.content)
	rooms = data['plugindata']['data']['list']

	return rooms


def main():
	session_id = __initialize_session()
	sender_id = __initialize_sender(session_id)
	rooms_history.update_rooms(__get_rooms_list(session_id, sender_id))


if __name__ == '__main__':
	main()