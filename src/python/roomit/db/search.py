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
