from django.template.response import TemplateResponse

from ..utils import search


def index(req):
    games = search.get_top_games({'limit': '5'}).get('games', [])
    services = search.get_top_platforms({'limit': '5'}).get('platforms', [])
    top_streams = search.filter_by_params({'limit': '6'})

    return TemplateResponse(req, 'discover.html', {'games': games, 'services': services, 'streams': top_streams['data']})