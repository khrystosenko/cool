import time

from hashlib import sha1

from django.conf import settings

from roomit import utils
from roomit.db import auth, users


def _generate_session_id(username, password):
    session_id = str(time.time()) + username + password
    return sha1(session_id).hexdigest()


def _generate_password(text):
    return sha1(text + settings.SECRET_KEY).hexdigest()


def signup(username, password, email):
    user = users.get_user(username, email)
    errors = []
    if user:
        if user['username'] == username:
            errors.append({
                'field': 'username', 
                'text': 'This username is already taken.'
            })

        if user['email'] == email:
            errors.append({
                'field': 'email',
                'text': 'This email is already taken.'
            })
    if errors:
        return {'errors': errors}

    password = _generate_password(password)
    auth.signup(username, password, email)

    return {'success': 'ok'}

def login(username, password):
    result = {'error': '', 'id': ''}
    password = _generate_password(password)
    user_data = auth.login(username, password)
    if not user_data:
        result['error'] = 'Either your username or password is incorrect.'
    else:
        session_id = _generate_session_id(username, password)
        auth.set_user_session(user_data['id'], sha1(session_id).hexdigest())
        result['id'] = session_id

    return result


def validate_session_id(session_id):
    return auth.validate_session_id(sha1(session_id).hexdigest())