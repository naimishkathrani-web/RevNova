// Project Types
export type ProjectType = 
  | 'migrate_master_data'           // Products, pricing, rules only (no in-flight data)
  | 'migrate_master_with_inflight'  // Complete migration with in-flight data
  | 'migrate_inflight_data'         // Only in-flight quotes/orders/contracts (after master is done)
  | 'design_product_ai';            // Phase 2: AI-powered product design

// Migration Phases
export type MigrationPhase = 
  | 'connect'              // Phase 1: Connect to orgs
  | 'analyze'              // Phase 2: Analyze schema and extract data
  | 'mapping'              // Phase 3: Field mappings
  | 'transform'            // Phase 4: Transform data to Staging 2
  | 'validate'             // Phase 5: Validate data quality
  | 'execute'              // Phase 6: Create custom objects/fields and import data
  | 'test'                 // Phase 7: Automated testing
  | 'import_transactions'  // Phase 8: Import in-flight data
  | 'report';              // Phase 9: Final report

// Configuration Types
export type RCAConfigType = 'custom_object' | 'custom_field';

export type RCAFieldType = 
  | 'Text' 
  | 'Number' 
  | 'Picklist' 
  | 'Date' 
  | 'DateTime' 
  | 'Checkbox' 
  | 'Currency' 
  | 'Email' 
  | 'Phone' 
  | 'URL' 
  | 'TextArea' 
  | 'LongTextArea';

// Conflict Types
export type ConflictType = 
  | 'create_new_field'
  | 'create_new_object'
  | 'data_type_mismatch'
  | 'required_field_missing'
  | 'duplicate_mapping';

export type ConflictSeverity = 'info' | 'warning' | 'error' | 'blocker';

export type ResolutionStatus = 'unresolved' | 'user_resolved' | 'auto_resolved' | 'ignored';

export type ResolutionAction = 
  | 'create_custom_field'
  | 'map_to_existing'
  | 'skip_field'
  | 'transform_data';

export type ConfigStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

// Interfaces
export interface Project {
  id: number;
  name: string;
  description?: string;
  project_type: ProjectType;
  include_inflight_data: boolean;
  skip_inflight_import: boolean;
  current_phase?: MigrationPhase;
  completed_phases?: MigrationPhase[];
  status?: string;
  created_at: Date;
}

export interface RCACustomConfiguration {
  id: number;
  project_id: number;
  config_type: RCAConfigType;
  source_object_name?: string;
  source_field_name?: string;
  rca_object_name: string;
  rca_field_name?: string;
  rca_field_type?: RCAFieldType;
  rca_field_length?: number;
  rca_field_required: boolean;
  rca_picklist_values?: string[];
  config_api_endpoint?: string;
  config_payload?: any;
  status: ConfigStatus;
  created_in_rca: boolean;
  rca_api_id?: string;
  error_message?: string;
  stg2_table_name?: string;
  stg2_column_name?: string;
  created_at: Date;
  executed_at?: Date;
}

export interface MappingConflict {
  id: number;
  project_id: number;
  field_mapping_id?: number;
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  source_object?: string;
  source_field?: string;
  source_data_type?: string;
  target_object?: string;
  target_field?: string;
  target_data_type?: string;
  resolution_status: ResolutionStatus;
  resolution_action?: ResolutionAction;
  resolution_details?: any;
  resolved_by?: string;
  resolved_at?: Date;
  rca_config_id?: number;
  conflict_description?: string;
  user_notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Phase Configuration based on Project Type
export const PHASE_CONFIGS: Record<ProjectType, MigrationPhase[]> = {
  migrate_master_data: [
    'connect',
    'analyze',
    'mapping',
    'transform',
    'validate',
    'execute',
    'test',
    'report'
  ],
  migrate_master_with_inflight: [
    'connect',
    'analyze',
    'mapping',
    'transform',
    'validate',
    'execute',
    'test',
    'import_transactions',
    'report'
  ],
  migrate_inflight_data: [
    'connect',
    'analyze',      // Re-analyze for new in-flight data
    'mapping',       // Map in-flight objects (may have conflicts)
    'transform',     // Transform in-flight data to Staging 2
    'execute',       // Import in-flight data to RCA
    'report'
  ],
  design_product_ai: [
    'connect',
    'report'  // Phase 2 feature - different flow
  ]
};

// Helper to get available phases for a project
export function getProjectPhases(projectType: ProjectType): MigrationPhase[] {
  return PHASE_CONFIGS[projectType] || [];
}

// Helper to check if a phase is available for a project type
export function isPhaseAvailable(projectType: ProjectType, phase: MigrationPhase): boolean {
  return PHASE_CONFIGS[projectType]?.includes(phase) || false;
}

// Helper to get next phase
export function getNextPhase(projectType: ProjectType, currentPhase: MigrationPhase): MigrationPhase | null {
  const phases = PHASE_CONFIGS[projectType];
  const currentIndex = phases.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === phases.length - 1) {
    return null;
  }
  return phases[currentIndex + 1];
}

// Phase display names
export const PHASE_NAMES: Record<MigrationPhase, string> = {
  connect: 'Connect to Organizations',
  analyze: 'Analyze & Extract Data',
  mapping: 'Field Mapping',
  transform: 'Data Transformation',
  validate: 'Data Validation',
  execute: 'Execute Migration',
  test: 'Automated Testing',
  import_transactions: 'Import In-Flight Data',
  report: 'Migration Report'
};

// Project type display names
export const PROJECT_TYPE_NAMES: Record<ProjectType, string> = {
  migrate_master_data: 'Migrate Master Data Only',
  migrate_master_with_inflight: 'Migrate Master Data + In-Flight Data',
  migrate_inflight_data: 'Migrate In-Flight Data Only',
  design_product_ai: 'Design Product with AI (Phase 2)'
};

// Project type descriptions
export const PROJECT_TYPE_DESCRIPTIONS: Record<ProjectType, string> = {
  migrate_master_data: 'Migrate products, pricing, and rules only. Skip in-flight quotes and transactions.',
  migrate_master_with_inflight: 'Complete migration including products, pricing, rules, and all in-flight data. Option to skip in-flight import.',
  migrate_inflight_data: 'Import only in-flight quotes, orders, and contracts. Use this after master data migration is complete.',
  design_product_ai: 'Use AI to design and configure new products in Revenue Cloud (Phase 2 feature).'
};
