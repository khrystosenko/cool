import time

from roomit import utils
from roomit.handlers import request

def get(req, name, default=''):
    """ Get a param from Django request dictionary as byte str.

    :param req: Request object
    :param name: key to get value for
    :param default: default value if such key was not found
    :return: value for a given key
    """
    value = req.REQUEST.get(name, default).strip().encode('utf8')
    value = utils.remove_script(value)
    return value


def get_params(req):
    """ Create str-valued copy of Django's request dictionary.

    :param req: Request object
    :return: dictionary with data
    """
    params = {}
    for key in req.REQUEST:
        params[key] = get(req, key)
    return params


def get_client_ip(req):
    x_forwarded_for = req.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = req.META.get('REMOTE_ADDR')
    return ip


def store_action(func):
    def wrapper(req, *args, **kwargs):
        result = func(req, *args, **kwargs)
        
        user_id = getattr(req, 'user', None)
        ip_address = get_client_ip(req)
        request.store_action(user_id, ip_address, req.path, time.time())

        return result

    return wrapper
