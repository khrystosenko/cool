from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.http import HttpResponseRedirect, Http404

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
    if not room_name:
        user_room = room.get_user_room(req.user)
        return redirect('/room/{}'.format(user_room['name']))

    room_owner = room.get_room_owner(room_name)
    if room_owner is None:
        raise Http404()

    context = {'my_room': room_owner == req.user}
    return TemplateResponse(req, 'room.html', context)