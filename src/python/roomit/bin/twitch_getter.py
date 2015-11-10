import json
import time
import requests

# Uncomment to run locally
import sys, os

sys.path.insert(1, os.getcwd() + '\\..\\..')
sys.path.insert(1, os.getcwd() + '\\..\\..\\..\\..\\www')
# or
# sys.path.insert(1, os.getcwd() + '/../..')
# sys.path.insert(1, os.getcwd() + '/../../../../www')
#
# and
os.environ["DJANGO_SETTINGS_MODULE"] = "settings"

from django.conf import settings

from roomit.handlers import twitch


def collect_data(link, result=[]):
	response = requests.get(link, verify=False)
	try:
		data = json.loads(response.content)
	except ValueError:
		return result
		
	result.extend(data['streams'])

	if len(result) % 1000 == 0:
		print 'Fetched ' + str(len(result)) + ' streams.'

	if data['streams']:
		next_link = data['_links']['next']
		return collect_data(next_link)

	return result

def main():
	start = time.time()
	data = collect_data('https://api.twitch.tv/kraken/streams?limit=100')
	print 'Total: ' + str(len(data)) + ' streams. Time:' + str(time.time() - start) + ' s.'
	print 'Updating data.'
	twitch.update_streams(data)

	print 'Time:' + str(time.time() - start) + ' s.'

if __name__ == '__main__':
	main()
