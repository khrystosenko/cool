from roomit import utils
from roomit.handlers import feedback


def create(params):
    username = params.get('username', '').strip()
    if not username:
        return utils.validation_error('username')

    if len(username) > 64:
        return utils.validation_error('username')

    if not utils.validate_regexp('username', username):
        return utils.validation_error('username')

    email = params.get('email').strip()
    if not email:
        return utils.validation_error('email')

    if not utils.validate_regexp('email', email):
        return utils.validation_error('email')

    text = params.get('text').strip()
    if not text or len(text) > 128:
        return utils.validation_error('text')

    return feedback.create(username, email, text)
