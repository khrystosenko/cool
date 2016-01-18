from roomit.db import dbcp

@dbcp.roomit
def __get_games(cursor):
    query = """ SELECT `id`, `name`
                FROM `games`
            """
    cursor.execute(query)
    data = {}
    for item in cursor.fetchall():
        data[item[1]] = item[0]

    return data

@dbcp.roomit
def __get_platform_id(cursor, value):
    query = """ SELECT `id`
                FROM `platforms`
                WHERE `name` = %s
            """
    cursor.execute(query, [value])
    data = cursor.fetchone()
    if data is None:
        query = """ INSERT INTO `platforms` (`name`)
                    VALUES (%s)
                """
        cursor.execute(query, [value])
        platform_id = cursor.lastrowid
    else:
        platform_id = data[0]

    return platform_id

@dbcp.roomit
def __get_game_id(cursor, value):
    query = """ SELECT `id`
                FROM `games`
                WHERE `name` = %s
            """
    cursor.execute(query, [value])
    data = cursor.fetchone()
    if data is None:
        query = """ INSERT INTO `games` (`name`)
                    VALUES (%s)
                """
        cursor.execute(query, [value])
        game_id = cursor.lastrowid
    else:
        game_id = data[0]

    return game_id

def __reset_streams(cursor, platform_id):
    query = """ UPDATE `streams`
                SET online = 0,
                    viewers = 0
                WHERE platform_id = %s
            """
    cursor.execute(query, [platform_id])

@dbcp.roomit
def update_streams(cursor, platform, streams):
    platform_id = __get_platform_id(platform)
    __reset_streams(cursor, platform_id)

    prepared_data = []
    games = __get_games()
    for stream in streams:
        if not stream['channel']['name'] or stream['game'] is None or len(stream['game'].strip()) > 192:
            continue

        game_name = stream['game'].strip()
        if not stream['channel']['display_name']:
            stream['channel']['display_name'] = stream['channel']['name']

        game_id = games.get(game_name)
        if not game_id:
            game_id = __get_game_id(game_name)
            games[stream['game']] = game_id

        prepared_data.append((platform_id, game_id, stream['channel']['_id'], 1, stream['viewers'],
                              stream['channel'].get('mature') or 0, stream['channel'].get('language') or '',
                              stream['channel']['display_name'], stream['channel']['name'],
                              stream['preview'].get('template'), stream['channel'].get('logo')))

    fields = ['platform_id', 'game_id', 'channel_id', 'online', 'viewers', 'mature', 
              'language', 'display_name', 'name', 'preview', 'logo']

    query = """ INSERT INTO `streams` (`%s`)
                    VALUES (%%s, %%s, %%s, %%s, %%s, %%s, %%s, %%s, %%s, %%s, %%s)
                    ON DUPLICATE KEY UPDATE
                        streams.game_id = VALUES(streams.game_id),
                        streams.online = VALUES(streams.online),
                        streams.viewers = VALUES(streams.viewers),
                        streams.mature = VALUES(streams.mature),
                        streams.language = VALUES(streams.language),
                        streams.display_name = VALUES(streams.display_name),
                        streams.name = VALUES(streams.name),
                        streams.preview = VALUES(streams.preview),
                        streams.logo = VALUES(streams.logo)
            """ % ('`, `'.join(fields),)

    cursor.executemany(query, prepared_data)
