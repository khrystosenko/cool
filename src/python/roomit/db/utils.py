
def get_one_or_none(cursor):
    try:
        return cursor.fetchone()[0]
    except (IndexError, TypeError):
        return