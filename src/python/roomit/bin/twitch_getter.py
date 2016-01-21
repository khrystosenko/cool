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


def collect_data(link, game_db_name, result=None):
    result = result or []

    response = requests.get(link, verify=False)
    try:
        data = json.loads(response.content)
    except ValueError:
        return result

    for stream in data['streams']:
        if not stream['channel']['name']:
            continue

        stream['game'] = game_db_name
        result.append(stream)

    if data['streams']:
        next_link = data['_links']['next']
        return collect_data(next_link, game_db_name, result)

    return result

def main():
    api = _config.get('roomit', 'twitch_api_url')
    start = time.time()

    streams = []
    for game in settings.GAMES:
        game_time = time.time()
        data = collect_data(api % (game['name'],), game['name'])
        print 'Total for {}: {} streams. Time: {}s'.format(game['name'], str(len(data)), int(time.time() - game_time))
        streams.extend(data)

    print 'Total: {}. Time: {}s.'.format(len(streams), int(time.time() - start))
    print 'Updating data.'

    platforms.update_twitch(streams)

    print 'Done. Time: {}s'.format(int(time.time() - start))


if __name__ == '__main__':
    main()
