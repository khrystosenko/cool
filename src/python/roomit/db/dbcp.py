import mysql.connector

from roomit import config

_config = config.get_config()
_connection = None

class connection_pool():

    def __init__(self, database):
        global _connection
        global _config

        if _connection is None:
            _connection = mysql.connector.connect(
                user=_config.get(database, 'username'),
                password=_config.get(database, 'password'),
                host=_config.get(database, 'host'),
                port=_config.getint(database, 'port'),
                database=_config.get(database, 'name'),
                charset=_config.get(database, 'charset')
            )

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


def roomit_readonly(func):
    def wrapper(*args, **kwargs):
        with connection_pool('ro_db') as cursor:
            return func(cursor, *args, **kwargs)

    return wrapper

def roomit(func):
    def wrapper(*args, **kwargs):
        with connection_pool('db') as cursor:
            return func(cursor, *args, **kwargs)

    return wrapper