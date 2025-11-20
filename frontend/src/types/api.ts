// ============================================
// PROJECT TYPES
// ============================================

export interface Project {
  id: number;
  name: string;
  description?: string;
  source_system: string;
  target_system: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  connection_count?: number;
  migration_job_count?: number;
  connections?: Connection[];
  migration_jobs?: MigrationJob[];
}

export type ProjectStatus =
  | 'draft'
  | 'analyzing'
  | 'mapping'
  | 'transforming'
  | 'validating'
  | 'executing'
  | 'completed'
  | 'failed';

export interface CreateProjectRequest {
  name: string;
  description?: string;
  sourceSystem: string;
  targetSystem: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  sourceSystem?: string;
  targetSystem?: string;
  status?: ProjectStatus;
}

// ============================================
// CONNECTION TYPES
// ============================================

export interface Connection {
  id: number;
  project_id: number;
  name: string;
  connection_type: 'source' | 'target';
  instance_url: string;
  status: 'active' | 'inactive' | 'error';
  last_tested_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConnectionRequest {
  name: string;
  connectionType: 'source' | 'target';
  instanceUrl: string;
  accessToken: string;
  refreshToken: string;
}

export interface UpdateConnectionRequest {
  name?: string;
  instanceUrl?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface TestConnectionRequest {
  instanceUrl: string;
  accessToken: string;
  refreshToken: string;
}

export interface TestConnectionResponse {
  success: boolean;
  organizationId?: string;
  username?: string;
  displayName?: string;
  error?: string;
}

// ============================================
// FIELD MAPPING TYPES
// ============================================

export interface FieldMapping {
  id: number;
  project_id: number;
  source_object: string;
  source_field: string;
  target_object: string;
  target_field: string;
  mapping_type: MappingType;
  transform_rule?: Record<string, any>;
  is_required: boolean;
  default_value?: string;
  status: MappingStatus;
  confidence_score?: number;
  reasoning?: string;
  created_at: string;
  updated_at: string;
}

export type MappingType = 'direct' | 'transform' | 'calculated' | 'lookup' | 'formula';

export type MappingStatus = 'pending' | 'validated' | 'approved' | 'rejected';

export interface CreateFieldMappingRequest {
  sourceObject: string;
  sourceField: string;
  targetObject: string;
  targetField: string;
  mappingType?: MappingType;
  transformRule?: Record<string, any>;
  isRequired?: boolean;
  defaultValue?: string;
}

export interface UpdateFieldMappingRequest {
  targetObject?: string;
  targetField?: string;
  mappingType?: MappingType;
  transformRule?: Record<string, any>;
  isRequired?: boolean;
  defaultValue?: string;
  status?: MappingStatus;
}

export interface BulkCreateMappingsRequest {
  mappings: CreateFieldMappingRequest[];
}

export interface AutoMapRequest {
  sourceObject: string;
  targetObject: string;
  confidenceThreshold?: number;
}

export interface AutoMapSuggestion {
  sourceObject: string;
  sourceField: string;
  targetObject: string;
  targetField: string;
  mappingType: MappingType;
  confidence: number;
}

// ============================================
// SCHEMA ANALYSIS TYPES
// ============================================

export interface SchemaAnalysis {
  id: number;
  project_id: number;
  source_object: string;
  source_metadata: SchemaMetadata;
  target_metadata: SchemaMetadata;
  field_count: number;
  relationship_count: number;
  analysis_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  analyzed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SchemaMetadata {
  objectName: string;
  label: string;
  fields: FieldMetadata[];
  relationships?: RelationshipMetadata[];
}

export interface FieldMetadata {
  name: string;
  label: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  required: boolean;
  unique: boolean;
  picklistValues?: string[];
  referenceTo?: string[];
  description?: string;
}

export interface RelationshipMetadata {
  name: string;
  relationshipType: 'lookup' | 'masterDetail' | 'hierarchical';
  referenceTo: string;
  cascadeDelete: boolean;
}

// ============================================
// MIGRATION JOB TYPES
// ============================================

export interface MigrationJob {
  id: number;
  project_id: number;
  job_name: string;
  job_type: 'full' | 'incremental' | 'validation';
  status: JobStatus;
  records_total?: number;
  records_processed?: number;
  records_success?: number;
  records_failed?: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export type JobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled';

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  count?: number;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================
// AI SUGGESTION TYPES
// ============================================

export interface AISuggestion {
  id: number;
  mapping_id: number;
  suggested_target_field: string;
  confidence_score: number;
  reasoning: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================
// FILTER AND QUERY TYPES
// ============================================

export interface ProjectFilters {
  status?: ProjectStatus;
  sourceSystem?: string;
  targetSystem?: string;
  search?: string;
}

export interface ConnectionFilters {
  connectionType?: 'source' | 'target';
  status?: 'active' | 'inactive' | 'error';
}

export interface FieldMappingFilters {
  objectName?: string;
  status?: MappingStatus;
  mappingType?: MappingType;
  search?: string;
}
