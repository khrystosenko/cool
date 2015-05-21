import time

from django.conf import settings

from roomit.db import dbcp


@dbcp.roomit
def store_room(cursor, link, room_uuid):
    query = """ INSERT INTO `rooms`
                    (`room_uuid`, `link`, `exp_time`)
                VALUES (%s, %s, %s)
            """
    cursor.execute(query, [room_uuid, link, time.time() + settings.ROOM_EXP_TIME])

@dbcp.roomit
def get_room(cursor, room_uuid):
    fields = ('room_uuid', 'link')
    query = """ SELECT `%s`
                FROM `rooms`
                WHERE `exp_time` >= %%s
                  AND `room_uuid` = %%s

            """ % ('`, `'.join(fields),)
    cursor.execute(query, [time.time(), room_uuid])
    data = dbcp.tuple2dict(cursor.fetchone(), fields)
    return data
