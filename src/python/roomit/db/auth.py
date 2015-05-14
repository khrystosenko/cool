import time

from django.conf import settings

from roomit import utils
from roomit.db import dbcp

@dbcp.roomit
def signup(cursor, username, password, email):
    fields = ['username', 'password', 'email']
    query = """ INSERT INTO `users` (`%s`)
                VALUES (%%s, %%s, %%s)
   			""" % ('`, `'.join(fields),)

    cursor.execute(query, [username, password, email])


@dbcp.roomit
def login(cursor, username, password):
	query = """ SELECT id
				FROM `users`
				WHERE username = %s
				  AND password = %s
			"""

	cursor.execute(query, [username, password])
	data = dbcp.tuple2dict(cursor.fetchone(), ('id',))
	return data

@dbcp.roomit
def set_user_session(cursor, user_id, session_id):
    query = """ INSERT INTO user_sessions
	            (user_id, session_id, exp_time)
	            VALUES(%s, %s, %s)
    		"""

    exp_time = int(time.time()) + settings.SESSION_EXP_TIME
    cursor.execute(query, [user_id, session_id, exp_time])

@dbcp.roomit
def validate_session_id(cursor, session_id):
    query = """ SELECT exp_time,
                       user_id
                FROM user_sessions
                WHERE session_id = '%s'
            """ % (session_id,)

    cursor.execute(query)
    data = cursor.fetchall()
    res = None
    if data and time.time() < data[0][0]:
        res = data[0][1]

    return res