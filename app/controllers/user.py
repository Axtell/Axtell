from app.db import db_conn

def get_user(user_id):
    cursor = db_conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user_data = cursor.fetchone()
    cursor.close()
    
    return user_data
