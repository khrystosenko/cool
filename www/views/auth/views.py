from django.shortcuts import redirect
from django.template.response import TemplateResponse

from ..utils import auth, request
from ..utils.views import JSONResponse


def signup(req):
    if req.method == 'POST':
        data = auth.signup(request.get_params(req))
        return JSONResponse(data, status=data.get('error_code', 200))

    return TemplateResponse(request, 'signup.html')

def login(req):
    # if auth.is_logged(req):
    #     return redirect('home')
        
    return TemplateResponse(request, 'login.html')

def logout(request):
    return TemplateResponse(request, 'index.html')

def profile(request):
    return TemplateResponse(request, 'profile.html')
    
def createroom(request):
    return TemplateResponse(request, 'createroom.html')
