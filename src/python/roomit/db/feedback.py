from roomit.db import dbcp


@dbcp.roomit
def create(cursor, username, email, text):
    query = """ INSERT INTO `feedbacks`
                    (`username`, `email`, `text`)
                VALUES (%s, %s, %s)
            """
    cursor.execute(query, [username, email, text])
    return {'success': 'ok'}