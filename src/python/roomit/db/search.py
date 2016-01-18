import time

from django.conf import settings

from roomit.db import dbcp


@dbcp.roomit_readonly
def get_by_params(cursor, game, platform, stream, only_online, offset, limit):
    fields = ('online', 'viewers', 'mature', 'language', 'display_name', 'name', 'preview', 'logo')
    filter_query = []
    params = []
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

    query = """ SELECT %s, g.name
                FROM `streams` s
                JOIN `games` g
                ON g.id = s.game_id
                %s
                ORDER BY `viewers` DESC
                LIMIT %%s
                OFFSET %%s
            """ % (','.join(['s.%s' % (field,) for field in fields]), filter_query)

    params.append(limit)
    params.append(offset)

    cursor.execute(query, params)
    data = dbcp.tuple2dict(cursor.fetchall(), fields + ('game',))
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