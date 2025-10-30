# RevNova Requirements Documentation

## 📋 Overview

This folder contains comprehensive requirements documentation for the RevNova SFDC CPQ → Revenue Cloud migration platform.

**Status: ENHANCED** ✅  
All core documentation is complete with detailed business rules, workflows, API specs, and database schemas.

## 📂 Documentation Structure

### Strategic Documents
- **product-vision.html** - Platform vision, 5-phase roadmap, technology stack, success metrics
- **business-requirements.html** - Stakeholder needs, business drivers, KPIs, constraints, non-functional requirements
- **requirements-mapping.html** - Comprehensive CPQ → RCA field mappings for all workstreams (WS1-WS5)
- **requirements-index.html** - Navigation hub for all requirements documents

### Phase-by-Phase Requirements

#### Phase 1: Product Catalog Migration (WS1) - MVP ✅ ENHANCED
- **requirements-phase1-functional.html**
  - 7 wizard pages (Connect, Analyze, Map, Transform, Validate, Execute, Test)
  - 60+ field-level specifications with UI controls, validation, placeholders
  - 24 detailed business rules (BR-CT-01 through BR-TST-03)
  - 5 user workflows with step-by-step actions
  - 10 acceptance criteria with verification methods
- **requirements-phase1-technical.html**
  - 40+ REST API endpoints with payloads and responses
  - Complete PostgreSQL schema (15+ tables with indexes)
  - Hybrid staging model (Vanilla + EAV) for custom fields
  - ID mapping, rollback tracking, audit logging
  - Batch processing architecture with RabbitMQ

#### Phase 2: Quotes & Pricing (WS2)
- **requirements-phase2-functional.html** - Quote migration, discount schedules (8 business rules)
- **requirements-phase2-technical.html** - Quote APIs, pricing transforms

#### Phase 3: Contracts & Assets (WS3)
- **requirements-phase3-functional.html** - Contract lifecycle, asset tracking (5 business rules)
- **requirements-phase3-technical.html** - Contract/asset APIs, subscription transform logic

#### Phase 4: Billing & Invoicing (WS4)
- **requirements-phase4-functional.html** - Invoice generation, payment tracking (4 business rules)
- **requirements-phase4-technical.html** - Billing APIs, invoice transform logic

#### Phase 5: Revenue Cloud Advanced (WS5)
- **requirements-phase5-functional.html** - Product hierarchies, bundles, EPC integration (2 business rules)
- **requirements-phase5-technical.html** - RCA product APIs, hierarchy management

## 🚀 Recent Enhancements (Last Update)

### Product Vision & Business Requirements (NEW)
- Added comprehensive product vision page with 5-phase strategy
- Created high-level business requirements with:
  - Executive summary and business problem statement
  - Stakeholder personas (IT Director, Salesforce Admin, Data Architect, etc.)
  - 6 core business requirements (BR-001 through BR-006)
  - Non-functional requirements table (performance, scalability, availability, security)
  - Success criteria & KPIs (adoption, migration success rate, CSAT, time-to-value)
  - Constraints and assumptions

### Phase 1 Functional Requirements (ENHANCED)
- Expanded field tables for all 7 wizard pages (Connect, Analyze, Map, Transform, Validate, Execute, Test)
- Added 60+ field specifications with UI control types, validation rules, placeholders, examples
- Expanded business rules from 5 to 24 detailed rules covering:
  - Connection validation (BR-CT-01 to BR-CT-04)
  - Field mapping logic (BR-MAP-01 to BR-MAP-04)
  - Transform configuration (BR-TRN-01 to BR-TRN-03)
  - Validation handling (BR-VAL-01 to BR-VAL-03)
  - Execution controls (BR-EXE-01 to BR-EXE-05)
  - Testing verification (BR-TST-01 to BR-TST-03)
- Added 5 detailed user workflows:
  - First-time migration setup
  - Field mapping with AI assistance
  - Data transformation & validation
  - Migration execution & monitoring
  - Post-migration testing & rollback
- Added 10 acceptance criteria with verification methods

### Phase 1 Technical Requirements (ENHANCED)
- Expanded API surface from 6 to 40+ endpoints
- Added comprehensive request/response payloads
- Complete database schema with:
  - 15+ core tables (projects, connections, field_mappings, value_maps, transforms)
  - Hybrid staging model (STG1/STG2 vanilla tables + EAV custom_data tables)
  - Execution tracking (executions, migration_batches, migration_tests)
  - ID mapping and audit logging tables
  - Performance indexes for all tables
- Added multi-tenant architecture patterns
- Detailed rollback tracking mechanism

### Field Mapping Document (ENHANCED)
- Expanded WS1 from 4 to 20+ field mappings (Product2, Pricebook2, PricebookEntry, Account)
- Expanded WS2 from 2 to 17+ field mappings (Quote, QuoteLine, DiscountSchedule)
- Expanded WS3 from 2 to 15+ field mappings (Subscription→Asset, Contract with BillingFrequency)
- Expanded WS4 from 1 to 14+ field mappings (Invoice, InvoiceLine, BillingAccount)
- Expanded WS5 from 1 to 12+ field mappings (Product hierarchy, ProductChildItem, PricingElement)
- All mappings include: complexity level, transform notes, data quality checks

## 🛠️ Generating Mapping HTML from Excel

If you have run the mapping Python script locally and produced `RevNova_Mapping_Full.xlsx`, use the helper script to convert it to HTML:

### How to Generate the Excel (mapping generator)
```powershell
pip install pandas openpyxl
python .\path\to\your\mapping_generator.py
# Produces RevNova_Mapping_Full.xlsx
```

### How to Convert Excel to HTML
```powershell
# From repository root
pip install pandas openpyxl
python .\scripts\generate_mapping_html.py -i .\RevNova_Mapping_Full.xlsx -d "C:\Users\user1\RevNovaRepository\docs\Diagrams"
```

This creates/overwrites:
- `docs/RevNovaRequirements/requirements-mapping.html` - Mapping tables for all workstreams
- `docs/RevNovaRequirements/images/` - Copied diagrams (if you pass `-d`)

## 📊 Requirements Coverage Summary

| Phase | Functional Req | Technical Req | Field Mappings | Business Rules | Status |
|-------|---------------|---------------|----------------|----------------|--------|
| Vision & Business | ✅ Complete | N/A | N/A | 6 core BR | ✅ Complete |
| Phase 1 (WS1) | ✅ Enhanced | ✅ Enhanced | 20+ fields | 24 rules | ✅ Complete |
| Phase 2 (WS2) | ✅ Complete | ✅ Complete | 17+ fields | 8 rules | ✅ Complete |
| Phase 3 (WS3) | ✅ Complete | ✅ Complete | 15+ fields | 5 rules | ✅ Complete |
| Phase 4 (WS4) | ✅ Complete | ✅ Complete | 14+ fields | 4 rules | ✅ Complete |
| Phase 5 (WS5) | ✅ Complete | ✅ Complete | 12+ fields | 2 rules | ✅ Complete |

## 🎯 Next Steps

1. **Review & Validate**: Stakeholders review all documents for accuracy and completeness
2. **Use Case Testing**: Validate workflows against actual migration scenarios
3. **API Implementation**: Backend team implements API endpoints per technical specs
4. **UI Development**: Frontend team builds wizard pages per functional specs
5. **Integration Testing**: Verify end-to-end migration with sample CPQ data

## 📝 Document Conventions

- **Business Rule IDs**: BR-XXX-NN format (e.g., BR-MAP-01)
- **API Endpoints**: RESTful /api/v1/resource pattern
- **Database Tables**: snake_case naming convention
- **Field Mappings**: Source API → Target API with transform notes
- **Status Values**: UPPERCASE enum values (e.g., 'QUEUED', 'RUNNING', 'COMPLETED')

## 🔗 Quick Links

- [Product Vision](product-vision.html) - Strategic overview
- [Business Requirements](business-requirements.html) - High-level needs
- [Field Mapping](requirements-mapping.html) - Complete field mappings
- [Phase 1 Functional](requirements-phase1-functional.html) - Detailed wizard specs
- [Phase 1 Technical](requirements-phase1-technical.html) - API & DB schema
- [Requirements Index](requirements-index.html) - Full navigation

---
**Last Updated**: Current session (comprehensive enhancements)  
**Maintained By**: RevNova Development Team  
**Version**: 2.0 (Enhanced)