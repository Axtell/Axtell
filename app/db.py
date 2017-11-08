import mysql.connector
import config

db_conn = mysql.connector.connect(**config.db_config)
