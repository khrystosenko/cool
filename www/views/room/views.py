from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.http import HttpResponseRedirect

from ..utils import room, request
from ..utils.views import JSONResponse


def create(req):
    if req.method == 'POST':
        room_uuid = room.generate_room(request.get_params(req))
        return JSONResponse({'room_uuid': room_uuid})

    return TemplateResponse(req, 'room/create.html')

def view(req):
    room_uuid = req.GET.get('uuid')
    if not room_uuid:
        return HttpResponseRedirect('/room/create/')

    data = room.get_room(room_uuid)
    if not data:
        return HttpResponseRedirect('/room/create/')

    return TemplateResponse(req, 'room/view.html', data)
