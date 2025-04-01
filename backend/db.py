from flask_mysql_connector import MySQL


mysql = MySQL()

def init_db(app):
    mysql.init_app(app)  
