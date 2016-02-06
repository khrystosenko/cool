from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.http import HttpResponseRedirect

from ..utils import room, request, auth
from ..utils.views import JSONResponse


@auth.login_required
def add(req):
    if req.method == 'POST':
        room.add_stream(req.user, request.get_params(req))
        return JSONResponse({'success': 'ok'})

    return JSONResponse({})


@auth.login_required
def delete(req):
	if req.method == 'DELETE':
		room.delete_stream(request.get_params(req))
        return JSONResponse({'success': 'ok'})

	return JSONResponse({})


@auth.login_required
def view(req, room_name):
    data = room.get_user_streams(req.user, room_name.strip())
    return TemplateResponse(req, 'room.html', data)