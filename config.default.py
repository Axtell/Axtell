app = {
    'host': '127.0.0.1',
    'port': 5000
}

db_config = {
    'user': 'MYSQL_USERNAME',
    'password': 'MYSQL_PASSWORD',
    'host': '127.0.0.1',
    'port': 3306,
    'database': 'ppcg'
}

redis_config = {
    'host': 'localhost',
    'password': 'REDIS_PASSWORD',
    'port': 6379,
    'db': 0
}

memcached_config = {
    'host': 'localhost',
    'port': 11211
}

pagination = {
    'links': 2
}

auth = {
    'google': {
        'client-id': 'GOOGLE_CLIENT_ID'
    }
}

posts = {
    'max_len': 16384,
    'min_len': 30,
    'min_title': 15,
    'max_title': 60,
    'per_page': 10
}

answers = {
    'lang_len': 40,
    'leaderboard_items': 5
}

secret_skey = 'SESSION_SECRET_KEY'
