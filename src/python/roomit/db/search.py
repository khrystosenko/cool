import time

from django.conf import settings

from roomit.db import dbcp


@dbcp.roomit_readonly
def get_by_params(cursor, user_id, game, platform, stream, only_online, offset, limit):
    fields = ('id', 'online', 'viewers', 'mature', 'language', 
        'display_name', 'name', 'preview', 'logo')
    
    filter_query = []
    params = []

    if user_id:
        params.append(user_id)

    if game:
        params.append(game)
        filter_query.append('`game_id` = %s')

    if platform:
        params.append(platform)
        filter_query.append('`platform_id` = %s')

    if only_online:
        filter_query.append('`online` = 1')

    if stream:
        params.append('%{}%'.format(stream))
        filter_query.append('s.name LIKE %s')

    filter_query = ' AND '.join(filter_query)
    if filter_query:
        filter_query = 'WHERE ' + filter_query

    query = """ SELECT %s, g.name, p.name, 
                       (us.user_id is not NULL) as added
                FROM `streams` s
                JOIN `games` g
                  ON g.id = s.game_id
                JOIN `platforms` p
                  ON p.id = s.platform_id
                LEFT JOIN `user_streams` us
                  ON us.stream_id = s.id
                 AND us.user_id %s
                %s
                ORDER BY `viewers` DESC
                LIMIT %%s
                OFFSET %%s
            """ % (','.join(['s.%s' % (field,) for field in fields]), 
                   'is NULL' if user_id is None else '= %s', filter_query)

    params.append(limit)
    params.append(offset)

    cursor.execute(query, params)
    data = dbcp.tuple2dict(cursor.fetchall(), fields + ('game', 'platform', 'added'))
    if isinstance(data, dict):
        data = [data]

    return data

@dbcp.roomit_readonly
def get_top_games(cursor, limit):
    fields = ['id', 'name']
    query = """ SELECT %s, SUM(viewers) as total_viewers
                FROM streams s
                JOIN games g
                  ON s.game_id = g.id
                WHERE online = 1
                GROUP BY s.game_id
                ORDER BY total_viewers DESC
                LIMIT %%s
            """ % (', '.join(['g.' + field for field in fields]))

    cursor.execute(query, [limit])
    data = dbcp.tuple2dict(cursor.fetchall(), fields)
    if isinstance(data, dict):
        data = [data]

    return data

@dbcp.roomit_readonly
def get_top_platforms(cursor, limit):
    fields = ['id', 'name']
    query = """ SELECT %s, SUM(viewers) as total_viewers
                FROM streams s
                JOIN platforms p
                  ON s.platform_id = p.id
                WHERE online = 1
                GROUP BY s.platform_id
                ORDER BY total_viewers DESC
                LIMIT %%s
            """ % (', '.join(['p.' + field for field in fields]))

    cursor.execute(query, [limit])
    data = dbcp.tuple2dict(cursor.fetchall(), fields)
    if isinstance(data, dict):
        data = [data]

    return data

@dbcp.roomit_readonly
def get_games_like(cursor, text, limit):
    fields = ['id', 'name']
    text =  '%%%s%%' % (text,)
    query = """ SELECT `%s`
                FROM games
                WHERE name LIKE %%s
                LIMIT %%s
            """ % ('`, `'.join(fields))

    cursor.execute(query, [text, limit])

    data = dbcp.tuple2dict(cursor.fetchall(), fields)
    if isinstance(data, dict):
        data = [data]

    return data

@dbcp.roomit_readonly
def get_game_ids(cursor, games):
    fields = ['id', 'name']

    where_query = 'WHERE name IN ({})'.format(', '.join(['%%s' for _ in range(len(games))]))

    query = """ SELECT `%s`
                FROM games
            """ + where_query
    query %= ('`, `'.join(fields))

    cursor.execute(query, games)
    data = dbcp.tuple2dict(cursor.fetchall(), fields)
    if isinstance(data, dict):
        data = [data]

    return data

@dbcp.roomit_readonly
def get_stream(cursor, stream_id):
    fields = ('id', 'platform', 'game', 'online', 'display_name', 'name', 'logo')

    query = """ SELECT s.id, p.name, g.name,
                       s.online, s.display_name,
                       s.name, s.logo
                FROM `streams` s
                JOIN `games` g
                  ON g.id = s.game_id
                JOIN `platforms` p
                  ON p.id = s.platform_id
                WHERE s.id = %s
            """

    cursor.execute(query, [stream_id])
    data = dbcp.tuple2dict(cursor.fetchall(), fields)
    if isinstance(data, dict):
        data = [data]

    return data