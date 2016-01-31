import re
import string

from django.conf import settings

from roomit import utils
from roomit.handlers import search


def filter_by_params(params):
    game = params.get('game', '0')
    if not game.isdigit():
        return utils.validation_error('game_id')

    game = int(game)

    platform = params.get('platform', '0')
    if not platform:
        return utils.validation_error('platform')

    platform = int(platform)

    only_online = params.get('online', '1')
    if only_online not in ['0', '1']:
        return utils.validation_error('online')

    only_online = bool(int(only_online))

    stream = params.get('stream', '').strip()

    offset = params.get('offset', '0')
    if not offset.isdigit():
        return utils.validation_error('offset')

    offset = int(offset)

    limit = params.get('limit', '25')
    if not limit.isdigit():
        return utils.validation_error('limit')

    limit = min(100, int(limit))

    data = search.filter_by_params(game, platform, stream, only_online, offset, limit)
    pattern = re.compile('[\W]+')

    platforms = dict((platform['name'], platform['url'])for platform in settings.PLATFORMS)

    for item in data['data']:
        language = settings.ROOMIT_LANG_CODE.get(item['language'])
        if language is None:
            language = settings.ROOMIT_LANG_CODE.get(item['language'][:2])

        if language is None:
            language = settings.ROOMIT_LANG_CODE.get(item['language'].split('-')[0])

        if language is None:
            language = item['language']

        item['language'] = language
        item['logo'] = item['logo'] or ''

    return data

def get_top_games(params):
    limit = params.get('limit', '10')
    if not limit.isdigit():
        return utils.validation_error('limit')

    limit = min(50, int(limit))

    return search.get_top_games(limit)

def get_top_platforms(params):
    limit = params.get('limit', '10')
    if not limit.isdigit():
        return utils.validation_error('limit')

    limit = min(50, int(limit))

    return search.get_top_platforms(limit)

def get_games_like(params):
    limit = params.get('limit', '10')
    if not limit.isdigit():
        return utils.validation_error('limit')

    limit = min(50, int(limit))

    text = params.get('text', '')
    if len(text) < 3 or len(text) > 128:
        return utils.validation_error('text')

    return search.get_games_like(text, limit)

def get_game_ids(games):
    if not isinstance(games, list):
        games = [games]

    data = search.get_game_ids(games)

    result = {}
    for item in data:
        result[item['name']] = item['id']

    return result