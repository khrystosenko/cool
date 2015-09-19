import time

from django.conf import settings

from roomit.db import dbcp


@dbcp.roomit
def get_by_params(cursor, game, platform, only_online, offset, limit):
    fields = ['online', 'viewers', 'mature', 'language', 'display_name', 'name', 'preview', 'logo']
    filter_query = []
    params = []
    if game:
        params.append(game)
        filter_query.append('`game_id` = %s')

    if platform:
        params.append(platform)
        filter_query.append('`service_id` = %s')

    if only_online:
        filter_query.append('`online` = 1')

    filter_query = ' AND '.join(filter_query)
    if filter_query:
        filter_query = 'WHERE ' + filter_query

    query = """ SELECT `%s`
                FROM `streams`
                %s
                LIMIT %%s
                OFFSET %%s
            """ % ('`, `'.join(fields), filter_query)

    params.append(limit)
    params.append(offset)

    cursor.execute(query, params)
    data = dbcp.tuple2dict(cursor.fetchall(), fields)

    return data

@dbcp.roomit
def get_top_games(cursor, limit):
    fields = ['id', 'name', 'logo']
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
    return data

@dbcp.roomit
def get_top_platforms(cursor, limit):
    fields = ['id', 'name', 'logo']
    query = """ SELECT %s, SUM(viewers) as total_viewers
                FROM streams s
                JOIN services p
                  ON s.service_id = p.id
                WHERE online = 1
                GROUP BY s.service_id
                ORDER BY total_viewers DESC
                LIMIT %%s
            """ % (', '.join(['p.' + field for field in fields]))

    cursor.execute(query, [limit])
    data = dbcp.tuple2dict(cursor.fetchall(), fields)
    return data

@dbcp.roomit
def get_games_like(cursor, text, limit):
    fields = ['id', 'name', 'logo']
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