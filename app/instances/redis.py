from redis import StrictRedis
from config import redis_config

redis_db = StrictRedis(**redis_config)
