# This is the main entry point to run the application.
from backend.app import app

if __name__ == '__main__':
    app.run(port=5000, debug=True)
