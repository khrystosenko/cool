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

@dbcp.roomit
def get_room(cursor, room_name):
    fields = ('id', 'service', 'channel')
    query = """ SELECT `%s`
                FROM `rooms`
                WHERE `exp_time` >= %%s
                  AND `name` = %%s

            """ % ('`, `'.join(fields),)
    cursor.execute(query, [time.time(), room_name])
    data = dbcp.tuple2dict(cursor.fetchone(), fields)
    return data
