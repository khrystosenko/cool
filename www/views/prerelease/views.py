from django.conf import settings
from django.template.response import TemplateResponse

from django.template.response import TemplateResponse

from ..utils import search


def prerelease(req):
    return TemplateResponse(req, 'prerelease.html')
