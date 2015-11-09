from django.template.response import TemplateResponse

from utils import search

# def index(req):
#     top_streams = search.filter_by_params({'limit': '6'})
#     return TemplateResponse(req, 'index.html', {'streams': top_streams['data']})
def prerelease(req):
    top_streams = search.filter_by_params({'limit': '6'})
    return TemplateResponse(req, 'prerelease.html', {'streams': top_streams['data']})
