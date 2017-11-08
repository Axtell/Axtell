# #!/usr/bin/env python3
#
# import mysql.connector
# from flask_assets import Environment, Bundle
#
# import config
#
# db_conn = None
#
# assets = Environment(app)
#
# scss = Bundle('main.scss', filters='pyscss', output='all.css')
# assets.register('scss_all', scss)
# 
#
#
#
# if __name__ == '__main__':
#     try:
#         db_conn = mysql.connector.connect(**config.db_config)
#         app.run(host='127.0.0.1', port=5000)
#     finally:
#         if db_conn is not None:
#             db_conn.close()
