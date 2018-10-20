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
    'google.com': {
        'client-id': 'GOOGLE_CLIENT_ID',
        'analytics-id': 'GOOGLE_ANALYTICS_CLIENT_ID',
        'view-id': ''
    },
    'stackexchange.com': {
        'client-id': 'SE_CLIENT_ID',
        'client-secret': 'SE_CLIENT_SECRET',
        'key': 'SE_KEY'
    },
    'github.com': {
        'client-id': 'GITHUB_CLIENT_ID',
        'client-secret': 'GITHUB_CLIENT_SECRET'
    },
    'imgur': {
        'client-id': 'IMGUR_CLIENT_ID'
    },
    'bugsnag': {
        'frontend': 'BUGSNAG_FRONTEND_API_KEY',
        'backend': 'BUGSNAG_BACKEND_API_KEY'
    },
    'algolia': {
        'app-id': '',
        'admin-key': '',
        'search-key': '',
        'prefix': 'test'
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

hotness = {
    'answer_weight': 4, # After 4 answers will become more significant
    'view_weight': 200, # After 600 views weight will become more significant
    'time_weight': 20 # In days
}

answers = {
    'lang_len': 40,
    'leaderboard_items': 5
}

users = {
    'min_name_len': 1,
    'max_name_len': 45
}

user_list = {
    # How many users to show in a followers/following list by default
    'page_len': 5
}

comments = {
    # Minimum comment length
    'min_len': 10,
    # Maximum comment length
    'max_len': 240,
    # How many top-level to comments to show by default
    'show_amt': 3,
    # For nested comments how many comments to show by default
    'nest_amt': 1
}

notifications = {
    # Show 5 notifications by default (same page size)
    'page_size': 5,
    # Apple Push Notifications ID
    'web_apn_id': '',
    # Apple APN Private Key ID
    'apns_key_id': '',
    # Apple Developer Team ID
    'apple_team_id': '',
    # Email address to contact as notification support
    'support_email': '',
    # Maximum amount of push devices
    'max_push_devices': 5,
    # Maximum amount of APN devices
    'max_apn_devices': 5
}

secret_skey = 'SESSION_SECRET_KEY'
