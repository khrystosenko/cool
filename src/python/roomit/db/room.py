import time

from django.conf import settings

from roomit.db import dbcp


@dbcp.roomit
def store_room(cursor, service, channel, name):
    query = """ INSERT INTO `rooms`
                    (`service`, `channel`, `name`, `exp_time`)
                VALUES (%s, %s, %s, %s)
            """
    cursor.execute(query, [service, channel, name,
                           time.time() + settings.ROOM_EXP_TIME])

@dbcp.roomit_readonly
def get_room(cursor, room_name):
    fields = ('id', 'service', 'channel', 'exp_time')
    query = """ SELECT `%s`
                FROM `rooms`
                WHERE `name` = %%s
            """ % ('`, `'.join(fields),)
    cursor.execute(query, [room_name])
    data = dbcp.tuple2dict(cursor.fetchone(), fields)

    if data and data['exp_time'] <= time.time():
        query = """ DELETE FROM `rooms`
                           WHERE `id` = %s 
                """
        cursor.execute(query, [data['id']])
        return {}

    return data
