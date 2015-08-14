from roomit.db import search

def filter_by_params(game, platform, only_online, offset, limit):
    data = search.get_by_params(game, platform, only_online, offset, limit)
    return {'data': data}