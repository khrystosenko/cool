from django.template.response import TemplateResponse

def index(req):
    return TemplateResponse(req, 'index.html')
