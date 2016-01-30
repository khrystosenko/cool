from django.shortcuts import redirect
from django.template.response import TemplateResponse

from ..utils import auth, request, response
from ..utils.views import JSONResponse


def facebook(req):
    session_hash, expiration = auth.facebook_login(req)

    resp = TemplateResponse(req, 'login.html', {'success': True})
    if session_hash:
        response.set_cookie(resp, 'session_id', session_hash, exp=expiration)

    return resp


@auth.login_required
def logout(req):
	auth.remove_sid(req)

	return redirect('/')