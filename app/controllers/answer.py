# from app.instances.db import db_conn
#
# def get_answer(post_id, answer_id):
#     cursor = db_conn.cursor(dictionary=True)
#     cursor.execute("SELECT * FROM answers WHERE post_id = %s AND id = %s", (post_id, answer_id))
#     post_data = cursor.fetchone()
#     cursor.close()
#
#     return post_data
