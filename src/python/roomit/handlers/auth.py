from roomit import utils
from roomit.db import auth, users


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

    password = utils.generate_password(password)
    auth.signup(username, password, email)

    return {'success': 'ok'}