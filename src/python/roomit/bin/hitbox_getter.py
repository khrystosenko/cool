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
from roomit import config

_config = config.get_config()


def collect_data(link, offset=0, result=[]):
    response = requests.get(link % (offset,), verify=False)
    try:
        data = json.loads(response.content)
    except ValueError:
        return result

    for stream in data.get('livestream', []):
        if stream.get('category_name') is None:
            continue

        game_name = stream.pop('category_name').strip().lower()
        for game in settings.GAMES:
            if game_name == game['name'].lower():
                stream['category_name'] = game['name']

        if stream.get('category_name') is None:
            continue

        result.append(stream)

    if len(result) % 1000 == 0:
        print 'Fetched ' + str(len(result)) + ' streams.'

    if data.get('livestream', []):
        return collect_data(link, offset + 250)

    return result

def main():
    start = time.time()
    data = collect_data(_config.get('roomit', 'hitbox_api_url'))
    print 'Total: ' + str(len(data)) + ' streams. Time:' + str(time.time() - start) + ' s.'
    print 'Updating data.'
    platforms.update_hitbox(data)

    print 'Time:' + str(time.time() - start) + ' s.'

if __name__ == '__main__':
    main()
