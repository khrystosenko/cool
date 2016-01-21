from roomit.db import dbcp
from roomit import config

_config = config.get_config()


@dbcp.roomit_readonly
def __get_games(cursor):
    query = """ SELECT `id`, `name`
                FROM `games`
            """
    cursor.execute(query)
    data = {}
    for item in cursor.fetchall():
        data[item[1]] = item[0]

    return data

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
def update_streams(cursor, platform, data):
    platform_id = __get_platform_id(cursor, platform)
    games = __get_games()

    prepared_data = FORMATERS[platform](cursor, platform_id, games, data)
    __reset_streams(cursor, platform_id)

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

def format_twitch_streams(cursor, platform_id, games, streams):
    prepared_data = []
    for stream in streams:
        game_name = stream['game']
        game_id = games.get(game_name)

        if not stream['channel']['display_name']:
            stream['channel']['display_name'] = stream['channel']['name']

        if not game_id:
            game_id = __get_game_id(cursor, game_name)
            games[stream['game']] = game_id

        prepared_data.append((platform_id, game_id, stream['channel']['_id'], 1, stream['viewers'],
                              stream['channel'].get('mature') or 0, stream['channel'].get('language') or '',
                              stream['channel']['display_name'], stream['channel']['name'],
                              stream['preview'].get('template'), stream['channel'].get('logo')))
    return prepared_data

def format_azubu_streams(cursor, platform_id, games, streams):
    prepared_data = []
    for stream in streams:
        game_name = stream['category']['title']
        game_id = games.get(game_name)

        if not stream['user']['display_name']:
            stream['user']['display_name'] = stream['user']['username']

        if not game_id:
            game_id = __get_game_id(cursor, game_name)
            games[stream['category']['title']] = game_id

        prepared_data.append((platform_id, game_id, stream['user']['id'], 1, stream['view_count'],
                              0, stream.get('language') or '', stream['user']['display_name'],
                              stream['user']['username'], stream['url_thumbnail'],
                              stream['user']['profile']['url_photo_small']))

    return prepared_data

def format_hitbox_streams(cursor, platform_id, games, streams):
    prepared_data = []
    for stream in streams:
        game_name = stream['category_name']
        game_id = games.get(game_name)

        if not stream['media_display_name']:
            stream['media_display_name'] = stream['media_name']

        if not game_id:
            game_id = __get_game_id(cursor, game_name)
            games[stream['category_name']] = game_id

        prepared_data.append((platform_id, game_id, stream['media_user_id'], 1, stream['media_views'],
                              stream['media_mature'] or 0,
                              '' if not stream['media_countries'] else stream['media_countries'][0].lower(),
                              stream['media_display_name'], stream['media_name'],
                              _config.get('roomit', 'hitbox_static_url') % (stream['media_thumbnail_large'],),
                              _config.get('roomit', 'hitbox_static_url') % (stream['channel']['user_logo_small'],)))

    return prepared_data

FORMATERS = {
    'twitch.tv': format_twitch_streams,
    'azubu': format_azubu_streams,
    'hitbox': format_hitbox_streams
}