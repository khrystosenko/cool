from django.shortcuts import redirect
from django.template.response import TemplateResponse

from ..utils import auth, request, response
from ..utils.views import JSONResponse


def signup(req):
    if req.method == 'POST':
        data = auth.signup(request.get_params(req))
        return JSONResponse(data, status=data.get('error_code', 200))

    return TemplateResponse(request, 'signup.html')

def login(req):
    if auth.is_logged(req):
        return redirect('index')

    if req.method == 'POST':
        username = req.POST.get('username', '')
        password = req.POST.get('password', '')
        data = auth.login(username, password)
        resp = JSONResponse(data, status=data.get('error_code', 200))
        if not data['error']:
            response.set_cookie(resp, 'session_id', data['id'])

        return resp
        
    return TemplateResponse(request, 'login.html')

def logout(request):
    return TemplateResponse(request, 'index.html')

def profile(request):
    return TemplateResponse(request, 'profile.html')
