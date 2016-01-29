from django.shortcuts import redirect

from django.template.response import TemplateResponse
from django.http import Http404

from utils import search, staticad, auth

def index(req):
    if auth.is_logged(req):
        return redirect('/discover/')

    top_streams = search.filter_by_params({'limit': '9'})
    return TemplateResponse(req, 'index.html', {'streams': top_streams['data']})


def get_static_ad(req, slug):
    stream = staticad.get_data(slug)
    if not stream:
        raise Http404

    return TemplateResponse(req, 'staticad.html', {'stream': stream})