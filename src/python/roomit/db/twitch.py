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
def __get_service_id(cursor, value):
    query = """ SELECT `id`
                FROM `services`
                WHERE `name` = %s
            """
    cursor.execute(query, [value])
    data = cursor.fetchone()
    if data is None:
        query = """ INSERT INTO `services` (`name`)
                    VALUES (%s)
                """
        cursor.execute(query, [value])
        service_id = cursor.lastrowid
    else:
        service_id = data[0]

    return service_id

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

@dbcp.roomit
def __reset_streams(cursor):
    query = """ UPDATE `streams`
                SET online = 0
            """
    cursor.execute(query)

@dbcp.roomit
def update_streams(cursor, streams):
    __reset_streams()

    prepared_data = []
    games = __get_games()
    service_id = __get_service_id('twitch')
    for stream in streams:
        if not stream['channel']['name'] or stream['game'] is None:
            continue

        if not stream['channel']['display_name']:
            stream['channel']['display_name'] = stream['channel']['name']

        game_id = games.get(stream['game'])
        if not game_id:
            game_id = __get_game_id(stream['game'])
            games[game_id] = stream['game']

        prepared_data.append((service_id, game_id, stream['channel']['_id'], True, stream['viewers'],
                              stream['channel'].get('mature') or 0, stream['channel'].get('language') or '',
                              stream['channel']['display_name'], stream['channel']['name'],
                              stream['preview'].get('template'), stream['channel'].get('logo')))

    fields = ['service_id', 'game_id', 'channel_id', 'online', 'viewers', 'mature', 
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