from roomit import utils
from roomit.handlers import auth


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
                return TemplateResponse(request, 'login.html')

    return wrapper


def is_logged(request):
    session_id = request.COOKIES.get('session_id', '')
    return session_id and auth.validate_session_id(session_id)


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


def login(username, password):
    return auth.login(username, password)