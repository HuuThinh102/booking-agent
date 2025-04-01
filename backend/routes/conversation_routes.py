from flask import Blueprint, request, jsonify
from db import mysql
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generate_title_from_gemini(message_content):
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"Generate a short and meaningful title for a conversation based on this message, maximum 8 word (not even backticks or **): {message_content}"
    try:
        response = model.generate_content(prompt)
        return response.text.strip() if response else "Untitled Conversation"
    except Exception as e:
        print("Error generating title from Gemini:", e) 
        return "Untitled Conversation"
conversation_routes = Blueprint('conversation_routes', __name__)


@conversation_routes.route('/conversation', methods=['GET'])
def get_conversation():
    iduser = request.args.get('iduser')

    if not iduser:
        return jsonify({"error": "Missing iduser"}), 400

    cursor = None
    try:
        cnx = mysql.connection
        cursor = cnx.cursor(dictionary=True)

        cursor.execute("SELECT idconversation, title FROM conversations WHERE iduser = %s ORDER BY create_at DESC", (iduser,))
        conversations = cursor.fetchall()

        return jsonify({"conversations": conversations}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()

@conversation_routes.route('/conversation', methods=['POST'])
def add_conversation():
    data = request.json
    iduser = data.get('iduser')
    title = data.get('title')
    first_message = data.get('first_message')

    if not iduser:
        return jsonify({"error": "Miss iduser"}), 400
    if not title and first_message:
        title = generate_title_from_gemini(first_message)
        print("title", title)
    
    cursor = None
    cnx = None
    try:
        cnx = mysql.connection
        cursor = cnx.cursor(dictionary=True)

        cursor.execute("INSERT INTO conversations (iduser, title) VALUES (%s, %s)", (iduser, title))
        cnx.commit()

        idconversation = cursor.lastrowid  # Lấy ID của conversation vừa thêm

        return jsonify({
            "message": "Create new conversation successful",
            "conversation": {
                "idconversation": idconversation,
                "iduser": iduser,
                "title": title
            }
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

@conversation_routes.route('/conversation', methods=['DELETE'])
def delete_conversation():
    data = request.json             
    idconversation = data.get('idconversation')
    if not idconversation:
        return jsonify({"error": "No idconversation found"}), 400
    
    cursor = None
    cnx = None
    try:
        cnx = mysql.connection
        cursor = cnx.cursor()

        cursor.execute("DELETE FROM conversations WHERE idconversation = %s", (idconversation,))
        cnx.commit()
        return jsonify({"message": "Conversation deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

@conversation_routes.route('/conversation', methods=["PUT"])
def rename_conversation():
    data = request.json
    idconversation = data.get('idconversation')
    new_title = data.get('title')

    if not idconversation or not new_title:
        return jsonify({"error": "Missing idconversation or title"}), 400    
    cursor = None
    cnx = None
    try:
        cnx = mysql.connection
        cursor = cnx.cursor()

        cursor.execute("UPDATE conversations SET title = %s WHERE idconversation = %s", (new_title, idconversation))
        cnx.commit()

        return jsonify({"message": "Conversation title updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
