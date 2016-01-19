import json
import time
import requests

# Uncomment to run locally
# import sys, os

# sys.path.insert(1, os.getcwd() + '\\..\\..')
# sys.path.insert(1, os.getcwd() + '\\..\\..\\..\\..\\www')
# or
# sys.path.insert(1, os.getcwd() + '/../..')
# sys.path.insert(1, os.getcwd() + '/../../../../www')
#
# and
# os.environ["DJANGO_SETTINGS_MODULE"] = "settings"

from django.conf import settings

from roomit.handlers import platforms


def collect_data(link, offset=0, result=[]):
    response = requests.get(link % (offset,), verify=False)
    try:
        data = json.loads(response.content)
    except ValueError:
        return result

    for stream in data['data']:
        if stream['category']['name'] is None:
            continue

        game_name = stream['category'].pop('title').strip().lower()
        for game in settings.GAMES:
            if game_name == game['name'].lower():
                stream['category']['title'] = game['name']

        if stream['category'].get('title') is None:
            continue

        result.append(stream)

    if data['data']:
        return collect_data(link, offset + 100)

    return result

def main():
    start = time.time()
    data = collect_data('http://api.azubu.tv/public/channel/live/list?limit=100&offset=%s')
    print 'Total: ' + str(len(data)) + ' streams. Time:' + str(time.time() - start) + ' s.'
    print 'Updating data.'
    platforms.update_azubu(data)

    print 'Time:' + str(time.time() - start) + ' s.'

if __name__ == '__main__':
    main()
