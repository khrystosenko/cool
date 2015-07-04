import time

from django.conf import settings

from roomit.db import dbcp


@dbcp.roomit
def store_room(cursor, service, channel):
    query = """ INSERT INTO `rooms`
                    (`service`, `channel`, `exp_time`)
                VALUES (%s, %s, %s)
            """
    cursor.execute(query, [service, channel, 
                           time.time() + settings.ROOM_EXP_TIME])
    return {'id': cursor.lastrowid}

@dbcp.roomit
def get_room(cursor, room_id):
    fields = ('id', 'service', 'channel')
    query = """ SELECT `%s`
                FROM `rooms`
                WHERE `exp_time` >= %%s
                  AND `id` = %%s

            """ % ('`, `'.join(fields),)
    cursor.execute(query, [time.time(), room_id])
    data = dbcp.tuple2dict(cursor.fetchone(), fields)
    return data
