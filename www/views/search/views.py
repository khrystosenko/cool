from django.shortcuts import redirect

from ..utils import search, request, auth
from ..utils.views import JSONResponse


@auth.is_logged
def filter_by_params(req):
    resp = search.filter_by_params(req.user, request.get_params(req))
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


@auth.login_required
def get_stream(req):
	resp = search.get_stream(request.get_params(req))
	return JSONResponse(resp)