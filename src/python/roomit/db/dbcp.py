import mysql.connector

from contextlib import contextmanager

from roomit import config

_config = config.get_config()


@contextmanager
def connection_pool(database):
    connection = mysql.connector.connect(
            user=_config.get(database, 'username'),
            password=_config.get(database, 'password'),
            host=_config.get(database, 'host'),
            port=_config.getint(database, 'port'),
            database=_config.get(database, 'name'),
            charset=_config.get(database, 'charset')
        )

    yield connection

    connection.close()


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
        with connection_pool('ro_db') as connection:
            try:
                result = func(connection.cursor(), *args, **kwargs)
                return result
            except:
                connection.rollback()
                raise

    return wrapper


def roomit(func):
    def wrapper(*args, **kwargs):
        with connection_pool('db') as connection:
            try:
                result = func(connection.cursor(), *args, **kwargs)
                connection.commit()
                return result
            except:
                connection.rollback()
                raise

    return wrapper