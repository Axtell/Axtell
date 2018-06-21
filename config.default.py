profile = False

app = {
    'host': '127.0.0.1',
    'port': 5000
}

canonical_host = 'http://127.0.0.1:5000'

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

auth = {
    'google': {
        'client-id': 'GOOGLE_CLIENT_ID',
        'analytics-id': 'GOOGLE_ANALYTICS_CLIENT_ID'
    },
    'imgur': {
        'client-id': 'IMGUR_CLIENT_ID'
    },
    'bugsnag': {
        'frontend': 'BUGSNAG_FRONTEND_API_KEY',
        'backend': 'BUGSNAG_BACKEND_API_KEY'
    }
}

oauth = {
    'se': {
        'client-id': 'SE_CLIENT_ID',
        'client-secret': 'SE_CLIENT_SECRET',
        'key': 'SE_KEY'
    }
}

pagination = {
    'links': 2
}

posts = {
    'max_len': 16384,
    'min_len': 30,
    'min_title': 15,
    'max_title': 60,
    'max_tags': 5,
    'per_page': 10
}

answers = {
    'lang_len': 40,
    'leaderboard_items': 5
}

users = {
    'min_name_len': 1,
    'max_name_len': 45
}

comments = {
    'min_len': 10,
    'max_len': 140,
    'show_amt': 3,
    'nest_amt': 1
}

secret_skey = 'SESSION_SECRET_KEY'
