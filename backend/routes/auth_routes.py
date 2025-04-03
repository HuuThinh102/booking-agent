from flask import Blueprint, request, jsonify
from db import mysql

auth_user_routes = Blueprint('auth_user_routes', __name__)

@auth_user_routes.route('/auth', methods=['POST'])
def auth_user():
    data = request.json
    iduser = data.get('iduser')
    username = data.get('username')

    if not iduser or not username:
        return jsonify({"error": "Thiếu thông tin iduser hoặc username"}), 400
    
    cursor = None
    cnx = None
    try:
        cnx = mysql.connection
        cursor = cnx.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE iduser = %s", (iduser,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"message": "Đăng nhập thành công", "user": existing_user}), 200
        
        cursor.execute("INSERT INTO users (iduser, user_name) VALUES (%s, %s)", (iduser, username))
        cnx.commit()
        return jsonify({"message": "Đăng ký thành công", "user": {"iduser": iduser, "user_name": username}}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()