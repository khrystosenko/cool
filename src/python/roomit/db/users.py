from roomit import utils
from roomit.db import dbcp

@dbcp.roomit
def get_user(cursor, username, email):
	fields = ['username', 'email']
	query = """ SELECT `%s`
				FROM `users`
				WHERE username = %%s 
				   OR email = %%s
	""" % ('`, `'.join(fields),)

	cursor.execute(query, [username, email])
	data = dbcp.tuple2dict(cursor.fetchall(), fields)
	return data