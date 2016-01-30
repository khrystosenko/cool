from roomit.db import request

def store_action(user_id, ip_address, path, ts):
    request.store_action(user_id, ip_address, path, ts)