import time
import requests

from roomit import utils
from roomit.config import get_config
from roomit.handlers import auth

_config = get_config()


def login_required(func):
    def wrapper(request, *args, **kwargs):
        session_id = request.COOKIES.get('session_id', '')
        user = auth.validate_session_id(session_id)
        if user:
            request.user = user
            return func(request, *args, **kwargs)
        else:
            if request.is_ajax():
                error = {'field': 'server',
                    'msg': 'Your session is expired, please reload the page.'}
                return JSONResponse({'error': error})
            else:
                return TemplateResponse(request, 'index.html')

    return wrapper


def is_logged(request):
    session_id = request.COOKIES.get('session_id', '')
    return session_id and auth.validate_session_id(session_id)


def facebook_login(request):
    if request.GET.get('error_code') or not request.GET.get('code'):
        return None, 0

    payload = {
        'client_id': _config.get('facebook', 'client_id'),
        'client_secret': _config.get('facebook', 'client_secret'),
        'redirect_uri': _config.get('facebook', 'redirect_uri'),
        'code': request.GET['code'],
        'scope': 'email'
    }

    response = requests.get(_config.get('facebook', 'access_token_url'), params=payload).json()
    if response.get('error'):
        return None, 0

    access_token = response['access_token']
    time_to_expire = response['expires_in']
    expires_in = int(time.time() + time_to_expire)

    response = requests.get(_config.get('facebook', 'me_url'), params={'access_token': access_token})
    data = response.json()

    user_id = auth.get_user_by_email(data['email'])
    if user_id is None:
        user_id = auth.get_user_by_snid('facebook', data['id'])

    if user_id is None:
        user_id = auth.create_user(email=data['email'], name=data['name'])

    session_id = auth.create_or_update_session_id(user_id, expires_in=expires_in)
    auth.link_social_network('facebook', user_id, data['id'], access_token, expires_in)

    return session_id, time_to_expire


def remove_sid(request):
    session_id = request.COOKIES.get('session_id')
    user_id = request.user

    return auth.remove_sid(session_id, user_id)