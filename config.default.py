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

auth = {
    'google': {
        'client-id': 'GOOGLE_CLIENT_ID'
    }
}

post_len = 16384
posts_per_page = 10
secret_skey = 'SESSION_SECRET_KEY'
