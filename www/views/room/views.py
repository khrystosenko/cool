from django.template.response import TemplateResponse

def create(request):
    return TemplateResponse(request, 'room/create.html')