from flask import g, session
from app.instances.db import db_conn
from app.instances import auth

def get_user_byid(user_id):
    cursor = db_conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user_data = cursor.fetchone()
    cursor.close()
    
    return user_data

def get_user_byoid(oid_key):
    cursor = db_conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE oid_key = %s", (oid_key,))
    user_data = cursor.fetchone()
    cursor.close()
    
    return user_data

def login(user_id):
    session[userid_skey] = user_id

def logout():
    session[userid_skey] = None
