from roomit import utils
from roomit.handlers import auth

def signup(params):
    username = params.get('username', '')
    if not username:
        return utils.validation_error('username')

    if len(username) > 15 or len(username) < 4:
        return utils.validation_error('username')

    if not utils.validate_regexp('username', username):
        return utils.validation_error('username')

    password = params.get('password', '')
    if not password:
        return utils.validation_error('password')

    if len(password) < 6 or len(password) > 50:
        return utils.validation_error('password')

    repassword = params.get('repassword', '')
    if password != repassword:
        return utils.validation_error('repassword')

    email = params.get('email')
    if not email:
        return utils.validation_error('email')

    if not utils.validate_regexp('email', email):
        return utils.validation_error('email')

    return auth.signup(username, password, email)