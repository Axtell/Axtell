from app.server import server
from flask_sqlalchemy import SQLAlchemy
import redis
import config

# SQL
db_config = config.db_config
server.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"
server.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(server)

# Redis
r = redis.StrictRedis(**config.redis_config)

@server.before_first_request
def setup_database():
    db.create_all()
