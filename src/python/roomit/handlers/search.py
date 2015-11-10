from roomit.db import search

def filter_by_params(game, platform, stream, only_online, offset, limit):
    data = search.get_by_params(game, platform, stream, only_online, offset, limit)
    return {'data': data}

def get_top_games(limit):
    data = search.get_top_games(limit)
    return {'games': data}

def get_top_platforms(limit):
    data = search.get_top_platforms(limit)
    return {'platforms': data}

def get_games_like(text, limit):
    data = search.get_games_like(text, limit)
    return {'games': data}