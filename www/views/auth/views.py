from django.shortcuts import redirect

from ..utils import auth, request
from ..utils.views import JSONResponse

def signup(req):
    data = auth.signup(request.get_params(req))
    return JSONResponse(data, status=data.get('error_code', 200))

def login(req):
    if auth.is_logged(req):
        return redirect('home')
        
    return JSONResponse({'status': 'ok'})

def logout(req):
    return JSONResponse({'status': 'ok'})