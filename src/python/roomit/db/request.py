from roomit.db import dbcp


@dbcp.roomit
def store_action(cursor, user_id, ip_address, path, ts):
    query = """ INSERT INTO `requests`
                VALUES(%s, INET_ATON(%s), %s, %s)
            """
    cursor.execute(query, [user_id, ip_address, path, ts])