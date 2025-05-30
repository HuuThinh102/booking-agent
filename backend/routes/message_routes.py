from flask import Blueprint, request, jsonify
from agent.booking_agent import BookingAgent  
from db import mysql

booking_agent = BookingAgent()

message_routes = Blueprint('message_routes', __name__)
@message_routes.route('/messages', methods=['GET'])
def get_messages():
    idconversation = request.args.get('idconversation')

    if not idconversation:
        return jsonify({"error": "Missing idconversation"}), 400

    cursor = None
    try:
        cnx = mysql.connection
        cursor = cnx.cursor(dictionary=True)

        cursor.execute("SELECT * FROM messages WHERE idconversation = %s ORDER BY create_at ASC", (idconversation,))
        messages = cursor.fetchall()

        return jsonify({"messages": messages}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()

@message_routes.route('/messages', methods=['POST'])
def create_message():
    data = request.json
    idconversation = data.get('idconversation')
    user_message = data.get('content')
    iduser = data.get('iduser')

    if not idconversation or not user_message:
        return jsonify({"error": "Missing idconversation or content"}), 400

    cursor = None
    try:
        cnx = mysql.connection
        cursor = cnx.cursor(dictionary=True)

        # Store user's message
        cursor.execute("INSERT INTO messages (idconversation, sender, content) VALUES (%s, 'user', %s)", (idconversation, user_message))
        cnx.commit()

        # Get reponse from AI Agent
        ai_response = booking_agent.get_response(user_message, iduser)["message"]

        # Store agent's message
        cursor.execute("INSERT INTO messages (idconversation, sender, content) VALUES (%s, 'ai', %s)", (idconversation, ai_response))
        cnx.commit()

        return jsonify({
            "user_message": user_message,
            "ai_response": ai_response
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
