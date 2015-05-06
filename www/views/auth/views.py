from django.template.response import TemplateResponse

def signup(request):
    return TemplateResponse(request, 'signup.html')

def login(request):
    return TemplateResponse(request, 'login.html')

def logout(request):
    return TemplateResponse(request, 'index.html')