from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from routes.auth_routes import auth_user_routes
from routes.conversation_routes import conversation_routes 
from routes.message_routes import message_routes
from db import init_db, mysql
from agent.booking_agent import BookingAgent
import os

load_dotenv()

app = Flask(__name__)
# app.config['MYSQL_HOST'] = 'localhost'
# app.config['MYSQL_USER'] = 'root'
# app.config['MYSQL_PASSWORD'] = ''
# app.config['MYSQL_DATABASE'] = 'ai_agent'

app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DATABASE'] = os.getenv('MYSQL_DATABASE')
app.config['MYSQL_PORT'] = int(os.getenv('MYSQL_PORT'))

init_db(app)
CORS(app)
load_dotenv()

booking_agent = BookingAgent()

frontend_folder = os.path.join(os.getcwd(),"..","frontend")
dist_folder = os.path.join(frontend_folder, "dist")

@app.route("/", defaults={"filename":""})
@app.route("/<path:filename>")
def index(filename):
    if filename and os.path.exists(os.path.join(dist_folder, filename)):
        return send_from_directory(dist_folder, filename)
    return send_from_directory(dist_folder, "index.html")

app.register_blueprint(auth_user_routes)
app.register_blueprint(conversation_routes)
app.register_blueprint(message_routes)

# app.run(debug=True, port=5000)
if __name__ == "__main__":
    app.run(debug=True)
