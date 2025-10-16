from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Project(db.Model):
    """Represents a single migration or configuration project."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    client_name = db.Column(db.String(200), nullable=False)
    project_type = db.Column(db.String(50), nullable=False) # 'MIGRATION' or 'CONFIGURATION'
    status = db.Column(db.String(100), default='Draft')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    staging_data = db.relationship('StagingData', backref='project', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'client_name': self.client_name,
            'project_type': self.project_type,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

class StagingData(db.Model):
    """Stores raw, extracted data from a source system for a specific project."""
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    object_name = db.Column(db.String(200), nullable=False)
    record_id = db.Column(db.String(18), nullable=False)
    data = db.Column(db.JSON, nullable=False) # Stores the raw JSON of the record

    __table_args__ = (db.UniqueConstraint('project_id', 'object_name', 'record_id', name='_project_object_record_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'object_name': self.object_name,
            'record_id': self.record_id,
            'data': self.data
        }

