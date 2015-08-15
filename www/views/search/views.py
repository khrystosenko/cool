from django.shortcuts import redirect

from ..utils import search, request
from ..utils.views import JSONResponse


def filter_by_params(req):
    resp = search.filter_by_params(request.get_params(req))
    return JSONResponse(resp)

def get_top_games(req):
    resp = search.get_top_games(request.get_params(req))
    return JSONResponse(resp)

def get_top_platforms(req):
    resp = search.get_top_platforms(request.get_params(req))
    return JSONResponse(resp)

def get_games_like(req):
    resp = search.get_games_like(request.get_params(req))
    return JSONResponse(resp)