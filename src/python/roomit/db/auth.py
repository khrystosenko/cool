from roomit import utils
from roomit.db import dbcp

@dbcp.roomit
def signup(cursor, username, password, email):
    fields = ['username', 'password', 'email']
    query = """ INSERT INTO `users` (`%s`)
                VALUES (%%s, %%s, %%s)
    """ % ('`, `'.join(fields),)

    cursor.execute(query, [username, password, email])