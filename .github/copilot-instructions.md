# RevNova AI Development Guide

## Project Overview
RevNova is a web-based application with a TypeScript/Node.js backend and HTML/CSS frontend. The project follows a structured organization with separate frontend and backend components.

## Repository Structure
```
/
├── backend/           # TypeScript/Node.js backend
│   └── src/          # Source code
├── docs/             # Documentation and requirements
├── mockup/           # Frontend mockups and designs
└── scripts/          # Utility scripts for automation
```

## Key Technologies
- Backend: Node.js with TypeScript
- Frontend: HTML/CSS with JavaScript
- Configuration: JSON-based configuration

## Development Workflow

### Setup
1. Install Node.js dependencies:
```bash
cd backend
npm install
```

2. Configure the application:
- Copy `config.example.json` to `config.json`
- Update configuration values as needed

### Development Standards
- TypeScript is used for backend development
- Frontend follows HTML5 standards
- Configuration uses JSON format

### Project Organization
- `/backend/src/`: Core backend implementation
- `/docs/`: Project documentation and requirements
- `/mockup/`: Frontend designs and prototypes
- `/scripts/`: Development automation tools

### Common Operations
1. Backend Development:
```bash
cd backend
npm run dev        # Start development server
npm run build      # Build TypeScript code
npm run test       # Run tests
```

2. Frontend Development:
- Edit files in `/mockup/` directory
- Use live server for testing

## Best Practices
1. Follow TypeScript type definitions strictly
2. Keep configuration in `config.json`
3. Document changes in appropriate `/docs/` sections
4. Use scripts in `/scripts/` for automation tasks

## Important Notes
- Always test changes locally before committing
- Update documentation when modifying core functionality
- Follow existing code structure and patterns