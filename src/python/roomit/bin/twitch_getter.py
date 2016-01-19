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


def collect_data(link, result=[]):
    response = requests.get(link, verify=False)
    try:
        data = json.loads(response.content)
    except ValueError:
        return result

    for stream in data['streams']:
        if not stream['channel']['name'] or stream['game'] is None:
            continue

        game_name = stream.pop('game').strip().lower()
        for game in settings.GAMES:
            if game_name in game['name'].lower():
                stream['game'] = game['name']

        if stream.get('game') is None:
            continue

        result.append(stream)

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
    platforms.update_twitch(data)

    print 'Time:' + str(time.time() - start) + ' s.'

if __name__ == '__main__':
    main()
