import time

from django.conf import settings

from roomit.db import dbcp, utils as dbutils


@dbcp.roomit
def follow_channels(cursor, user_id, platform, channels):
    query = """ SELECT s.id
                FROM `streams` s
                JOIN `platforms` p
                  ON p.id = s.platform_id
                WHERE p.name = %%s
                  AND s.channel_id IN (%s)
            """ % (', '.join(['%s' for _ in channels]))

    cursor.execute(query, [platform] + channels)
    data = [(stream_id, user_id) for stream_id, in cursor.fetchall()]

    query = """ INSERT INTO `user_streams`
                (`stream_id`, `user_id`)
                VALUES(%s, %s)
            """
    cursor.executemany(query, data)


@dbcp.roomit
def follow_channels_by_ids(cursor, user_id, channels):
    data = [(stream_id, user_id) for stream_id in channels]
    query = """ INSERT INTO `user_streams` 
                (`stream_id`, `user_id`)
                VALUES(%s, %s)
            """
    cursor.executemany(query, data)


@dbcp.roomit
def create_room(cursor, user_id, room_name):
    query = """ INSERT INTO `rooms`
                VALUES (%s, %s)
            """
    cursor.execute(query, [user_id, room_name])
    return cursor.lastrowid


@dbcp.roomit_readonly
def get_room(cursor, room_name):
    query = """ SELECT `user_id`
                FROM `rooms`
                WHERE BINARY name = %s
            """
    cursor.execute(query, [room_name])
    return dbutils.get_one_or_none(cursor)


@dbcp.roomit_readonly
def get_user_streams(cursor, user_id):
    fields = ('id', 'platform', 'game', 'online', 'display_name', 'name', 'logo')

    query = """ SELECT s.id, p.name, g.name,
                       s.online, s.display_name,
                       s.name, s.logo
                FROM `user_streams` us
                JOIN `streams` s
                  ON s.id = us.stream_id
                JOIN `games` g
                  ON g.id = s.game_id
                JOIN `platforms` p
                  ON p.id = s.platform_id
                WHERE us.user_id = %s
            """

    cursor.execute(query, [user_id])
    data = dbcp.tuple2dict(cursor.fetchall(), fields)
    return data
