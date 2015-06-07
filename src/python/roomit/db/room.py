import time

from django.conf import settings

from roomit.db import dbcp


@dbcp.roomit
def store_room(cursor, service, channel, room_uuid):
    query = """ INSERT INTO `rooms`
                    (`room_uuid`, `service`, `channel`, `exp_time`)
                VALUES (%s, %s, %s, %s)
            """
    cursor.execute(query, [room_uuid, service, channel, 
                           time.time() + settings.ROOM_EXP_TIME])

@dbcp.roomit
def get_room(cursor, room_uuid):
    fields = ('room_uuid', 'service', 'channel')
    query = """ SELECT `%s`
                FROM `rooms`
                WHERE `exp_time` >= %%s
                  AND `room_uuid` = %%s

            """ % ('`, `'.join(fields),)
    cursor.execute(query, [time.time(), room_uuid])
    data = dbcp.tuple2dict(cursor.fetchone(), fields)
    return data
