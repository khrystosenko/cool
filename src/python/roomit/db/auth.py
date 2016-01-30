import time

from django.conf import settings

from roomit import utils
from roomit.db import dbcp
from roomit.db import utils as dbutils


def _get_network_id(cursor, platform):
    query = """ SELECT id
                FROM `social_networks`
                WHERE name = %s
            """
    cursor.execute(query, [platform])
    return cursor.fetchone()[0]


@dbcp.roomit_readonly
def get_user_by_email(cursor, email):
    query = """ SELECT id
                FROM `users`
                WHERE email = %s
            """
    cursor.execute(query, [email])
    return dbutils.get_one_or_none(cursor)


@dbcp.roomit_readonly
def get_user_by_snid(cursor, network, network_user_id):
    query = """ SELECT u.id
                FROM `users` u
                JOIN `social_connections` sc
                  ON u.id = sc.user_id
                JOIN `social_networks` sn
                  ON sn.id = sc.social_network_id
                WHERE sc.social_user_id = %s
                  AND sn.name = %s
            """

    cursor.execute(query, [network_user_id, network])
    return dbutils.get_one_or_none(cursor)


@dbcp.roomit
def create_user(cursor, email, password, name):
    query = """ INSERT INTO `users`
                (email, password, name)
                VALUES(%s, %s, %s)
            """
    cursor.execute(query, [email, password, name])
    return cursor.lastrowid


@dbcp.roomit
def link_social_network(cursor, network, user_id, network_user_id, access_token, expires_in):
    network_id = _get_network_id(cursor, network)

    query = """ SELECT id
                FROM `social_connections`
                WHERE user_id = %s
                  AND social_network_id = %s
                  AND social_user_id = %s
            """

    cursor.execute(query, [user_id, network_id, user_id])
    social_connection_id = dbutils.get_one_or_none(cursor)
    if social_connection_id:
        query = """ UPDATE `social_connections`
                    SET access_token = %s,
                        expires = %s
                    WHERE id = %s
                """
        cursor.execute(query, [access_token, expires_in, social_connection_id])
    else:
        query = """ INSERT INTO `social_connections`
                    (user_id, social_network_id, social_user_id, access_token, expires)
                    VALUES (%s, %s, %s, %s, %s)
                """
        cursor.execute(query, [user_id, network_id, network_user_id, access_token, expires_in])


@dbcp.roomit
def create_or_update_session_id(cursor, user_id, session_hash, expires_in):
    query = """ INSERT INTO `user_sessions`
                (session_hash, user_id, exp_time)
                VALUES(%s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    user_sessions.session_hash = VALUES(user_sessions.session_hash),
                    user_sessions.exp_time = VALUES(user_sessions.exp_time)
            """
    cursor.execute(query, [session_hash, user_id, expires_in])


@dbcp.roomit
def validate_session_id(cursor, session_hash):
    query = """ SELECT exp_time, user_id
                FROM `user_sessions`
                WHERE session_hash = %s
            """
    cursor.execute(query, [session_hash])
    result = cursor.fetchone()
    if not result:
        return

    exp_time, user_id = result
    if exp_time < time.time():
        return

    return user_id


@dbcp.roomit
def remove_sid(cursor, session_hash, user_id):
    query = """ DELETE FROM `user_sessions`
                WHERE session_hash = %s
                  AND user_id = %s
            """
    cursor.execute(query, [session_hash, user_id])