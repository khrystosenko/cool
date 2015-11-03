import mysql.connector

from django.conf import settings


_connection = None

class connection_pool():

	def __init__(self, database):
		global _connection
		if _connection is None:
			_connection = mysql.connector.connect(**settings.DBS[database])

		self._connection = _connection

	def __enter__(self):
		return self._connection.cursor()

	def __exit__(self, *args, **kwargs):
		self._connection.commit()


def tuple2dict(arr, fields):
	if arr is None:
		return {}

	if type(arr) is tuple:
		arr = [arr]

	if len(arr) == 1:
		data = {fields[i]: arr[j][i] for i in range(len(fields)) for j in range(len(arr))}
	else:
		data = []
		for item in arr:
			row = {}
			for i in range(len(fields)):
				row[fields[i]] = item[i]

			data.append(row)

	return data


def roomit(func):
	def wrapper(*args, **kwargs):
		with connection_pool('roomit') as cursor:
			return func(cursor, *args, **kwargs)

	return wrapper