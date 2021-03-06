from django.conf import settings
from django.template.response import TemplateResponse

from ..utils import search


def index(req):
    games = settings.DISCOVER_FILTER_GAMES
    game_ids = search.get_game_ids([game['name'] for game in games])

    for game in games:
        game['id'] = game_ids[game['name']]

    return TemplateResponse(req, 'discover.html', {'games': games})