import app.server
from flask_sqlalchemy import SQLAlchemy
import redis
import config

server = app.server.server

# SQL
db_config = config.db_config
server.config['SQLALCHEMY_DATABASE_URI'] = \
    f"mysql+mysqlconnector://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/" \
    f"{db_config['database']}?charset=utf8mb4"
server.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(server)

# Redis
redis_db = redis.StrictRedis(**config.redis_config)


@server.before_first_request
def setup_database():
    db.create_all()
