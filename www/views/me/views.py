from django.shortcuts import redirect

from ..utils import auth, room
from ..utils.views import JSONResponse


@auth.login_required
def get_user_streams(req):
    resp = room.get_user_streams(req.user)
    return JSONResponse(resp)