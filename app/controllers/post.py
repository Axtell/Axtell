from app.db import db_conn

def get_post(post_id):
    cursor = db_conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM posts WHERE id = %s", (post_id,))
    post_data = cursor.fetchone()
    cursor.close()
    
    return post_data
