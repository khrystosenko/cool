from django.conf import settings
from django.template.response import TemplateResponse

from django.template.response import TemplateResponse

from ..utils import search

def prerelease(req):
    top_streams = search.filter_by_params({'limit': '6'})
    return TemplateResponse(req, 'prerelease.html', {'streams': top_streams['data']})
