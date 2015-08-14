from django.shortcuts import redirect

from ..utils import search, request
from ..utils.views import JSONResponse


def filter_by_params(req):
    resp = search.filter_by_params(request.get_params(req))
    return JSONResponse(resp)