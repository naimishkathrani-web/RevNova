from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os

# --- App Configuration ---
app = Flask(__name__)

# --- Database Configuration ---
# In a real app, these would come from environment variables or a config file.
db_user = "postgres"
db_pass = "YOUR_POSTGRES_PASSWORD" # IMPORTANT: Replace with the password you created.
db_host = "localhost"
db_port = "5432"
db_name = "revnova_dev" # We start by connecting to our dev database.

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.urandom(24)
CORS(app)

# Initialize Database
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Import models after db is initialized to avoid circular imports
# CORRECTED IMPORT: Added a "." to specify a relative import from the same package.
from .models import Project, StagingData

# --- API Routes ---

@app.route('/api/status')
def status():
    """A simple health check endpoint."""
    return jsonify({'status': 'ok', 'message': 'RevNova Backend is running.'})

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Retrieves all projects from the database."""
    try:
        projects = Project.query.all()
        return jsonify([p.to_dict() for p in projects])
    except Exception as e:
        # This will help us debug if the database connection fails
        return jsonify({'error': 'Could not connect to the database.', 'details': str(e)}), 500

