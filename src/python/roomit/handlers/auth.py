import time

from hashlib import md5

from mysql.connector.errors import IntegrityError

from django.conf import settings

from roomit import utils
from roomit.db import auth, users


def _generate_hash(text, salt='salt'):
    return md5(md5(str(text)).hexdigest() + salt).hexdigest()


def get_user_by_email(email):
    return auth.get_user_by_email(email)


def get_user_by_snid(network, network_user_id):
    return auth.get_user_by_snid(network, network_user_id)


def create_user(email, password=None, name=None):
    return auth.create_user(email, password, name)


def link_social_network(network, user_id, network_user_id, access_token, expires_in):
    try:
        auth.link_social_network(network, user_id, network_user_id, access_token, expires_in)
        return {'success': 'ok'}
    except IntegrityError:
        return {'error': 'Social network cannot be linked'}


def create_or_update_session_id(user_id, expires_in=settings.SESSION_EXP_TIME):
    session_id = _generate_hash(user_id + time.time())
    auth.create_or_update_session_id(user_id, _generate_hash(session_id), expires_in)

    return session_id


def validate_session_id(session_id):
    return auth.validate_session_id(_generate_hash(session_id))


def remove_sid(session_id, user_id):
    return auth.remove_sid(_generate_hash(session_id), user_id)