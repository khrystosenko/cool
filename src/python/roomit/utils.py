import os
import re

from django.conf import settings


def validation_error(parameter, value=None):
    msg = 'Invalid "%s" value' % (parameter,)
    if value is not None:
        msg += '("%s")' % (value,)

    return {'error': msg, 'error_code': 406}

def validate_regexp(key, value):
    return re.match(settings.REGEXP[key], value)


_script_pattern = re.compile(
                    r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>',
                    flags=re.IGNORECASE)

def remove_script(input_str):
    if input_str:
        return _script_pattern.sub('[filtered]', input_str)
    else:
        return input_str