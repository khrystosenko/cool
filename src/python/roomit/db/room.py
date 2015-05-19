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
