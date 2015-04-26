from sds_dashboard import utils

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
