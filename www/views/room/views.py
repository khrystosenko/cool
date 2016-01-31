from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.http import HttpResponseRedirect

from ..utils import room, request, auth
from ..utils.views import JSONResponse


@auth.login_required
def add(req):
    if req.method == 'POST':
        # resp = room.generate_room(request.get_params(req))
        return JSONResponse({'success': 'ok'})

    return JSONResponse({})

def view(req, room_name):
    data = room.get_room(room_name)
    if not data:
        return HttpResponseRedirect('/discover/')

    return TemplateResponse(req, 'room.html', data)