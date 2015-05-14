from django.conf import settings
def set_cookie(response, key, value, exp=None):
    if exp is None:
        exp = settings.SESSION_EXP_TIME

    response.set_cookie(key, value, expires=exp)