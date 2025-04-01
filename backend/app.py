from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.auth_routes import auth_user_routes
from routes.conversation_routes import conversation_routes 
from routes.message_routes import message_routes
from db import init_db
from agent.agent_booking import BookingAgent


app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'huuthinhct'
app.config['MYSQL_DATABASE'] = 'ai_agent'

init_db(app)
CORS(app)
load_dotenv()

booking_agent = BookingAgent()  

app.register_blueprint(auth_user_routes)
app.register_blueprint(conversation_routes)
app.register_blueprint(message_routes)


app.run(debug=True, port=5000)
