import os
from datetime import datetime, timedelta
import re
from langchain.agents import initialize_agent, AgentType
from langchain_google_genai import GoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain.schema import SystemMessage, AIMessage, HumanMessage
from dotenv import load_dotenv

load_dotenv()

with open('./system_messages_2.txt', 'r') as f:
    system_message = f.read()

class BookingAgent:
    def __init__(self):
        self.db = None
        self.agent = None
        self.chat_history = [
            SystemMessage(content=system_message),
        ]
        self.init_database(
            user=os.getenv('MYSQL_USER', 'sql12770793'),
            password=os.getenv('MYSQL_PASSWORD', 'f9I3gp1U5n'),
            host=os.getenv('MYSQL_HOST', 'sql12.freesqldatabase.com'),
            port=os.getenv('MYSQL_PORT', '3306'),
            database=os.getenv('MYSQL_DATABASE', 'sql12770793')
        )

    def init_database(self, user: str, password: str, host: str, port: str, database: str) -> bool:
        try:
            db_uri = f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{database}"
            self.db = SQLDatabase.from_uri(db_uri)
            self.agent = self._get_agent()
            return True
        except Exception as e:
            print(f"Database connection error: {e}")
            return False

    def _get_agent(self):
        llm = GoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.getenv("GOOGLE_API_KEY"))
        toolkit = SQLDatabaseToolkit(db=self.db, llm=llm)
        
        memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

        agent = initialize_agent(
            tools=toolkit.get_tools(),
            llm=llm,
            agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
            memory=memory,
            verbose=True
        )

        return agent

    def _get_today_and_tomorrow(self):
        today = datetime.today().strftime('%Y-%m-%d')
        tomorrow = (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d')
        return today, tomorrow

    def _preprocess_query(self, user_query: str) -> str:
        today, tomorrow = self._get_today_and_tomorrow()
        user_query = re.sub(r'\btoday\b', today, user_query, flags=re.IGNORECASE)
        user_query = re.sub(r'\btomorrow\b', tomorrow, user_query, flags=re.IGNORECASE)
        return user_query

    def get_response(self, user_query: str):
        if self.agent is None:
            return {
                "status": "error",
                "message": "Please connect to the database first."
            }
        
        processed_query = self._preprocess_query(user_query)
        
        try:
            response = self.agent.run(processed_query)
            self.chat_history.extend([
                HumanMessage(content=user_query),
                AIMessage(content=response)
            ])
            return {
                "status": "success",
                "message": response,
                "chat_history": [
                    {"role": "system" if isinstance(msg, SystemMessage) else 
                             "ai" if isinstance(msg, AIMessage) else "human",
                     "content": msg.content}
                    for msg in self.chat_history
                ]
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"An error occurred: {str(e)}"
            }
