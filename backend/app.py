import os
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow React to communicate with this server

# --- CONFIGURATION ---
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("No API key found. Please set GEMINI_API_KEY in backend/.env")

genai.configure(api_key=GEMINI_API_KEY)

# Create a folder for generated files to keep things organized
OUTPUT_DIR = "generated_files"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- TOOLS / FUNCTIONS ---
def create_code_file(filename: str, content: str):
    """
    Creates a file with the specified filename and content.
    """
    filepath = os.path.join(OUTPUT_DIR, filename)
    try:
        with open(filepath, "w") as f:
            f.write(content)
        return f"SUCCESS: File '{filename}' created successfully in {OUTPUT_DIR}."
    except Exception as e:
        return f"ERROR: Failed to create file. {str(e)}"

# Now that libraries are updated, we pass the function directly so it is executable
tools_list = [create_code_file]

# --- GEMINI MODEL SETUP ---
model = genai.GenerativeModel(
    model_name='gemini-2.5-flash', # Or gemini-pro
    tools=tools_list,
    system_instruction="""
    You are an expert AI Coding Assistant.
    1. If the user asks to EXPLAIN code, explain it clearly.
    2. If the user asks to FIX bugs, provide the fixed code and explain the fix.
    3. If the user asks to GENERATE files or code, you MUST use the 'create_code_file' tool to save the file.
    Always be helpful and concise.
    """
)

# Start a chat session (history is not persisted in this simple backend version for simplicity, 
# but Gemini object handles immediate context)
chat = model.start_chat(enable_automatic_function_calling=True)

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    user_message = data.get('message')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        # Send message to Gemini
        response = chat.send_message(user_message)
        
        # Return the text response to the frontend
        return jsonify({
            "response": response.text
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Backend running on http://localhost:5000")
    app.run(debug=True, port=5000)