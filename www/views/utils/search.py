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

    offset = params.get('offset', '0')
    if not offset.isdigit():
        return utils.validation_error('offset')

    offset = int(offset)

    limit = params.get('limit', '25')
    if not limit.isdigit():
        return utils.validation_error('limit')

    limit = min(100, int(limit))

    return search.filter_by_params(game, platform, only_online, offset, limit)
