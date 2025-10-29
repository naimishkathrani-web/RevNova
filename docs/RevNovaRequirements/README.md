# RevNova Requirements - Mapping HTML Generator

This folder contains generated requirement HTML pages for the RevNova project.

If you have run the mapping Python script locally and produced `RevNova_Mapping_Full.xlsx`, use the helper script in `scripts/` to convert that workbook into a developer-friendly HTML page.

How to generate the Excel (mapping generator)
1. Ensure Python 3.8+ is installed.
2. From the repository root (PowerShell):

```powershell
pip install pandas openpyxl
python .\path\to\your\mapping_generator.py
# The mapping generator should produce RevNova_Mapping_Full.xlsx in the repo root (or the location it writes to).
```

How to convert the generated workbook to HTML

```powershell
# from the repository root
pip install pandas openpyxl
python .\scripts\generate_mapping_html.py -i .\RevNova_Mapping_Full.xlsx -d "C:\Users\user1\RevNovaRepository\docs\Diagramsms"
```

This will create (or overwrite):

- `docs/RevNovaRequirements/requirements-mapping.html` — the generated mapping HTML with tables for every sheet.
- `docs/RevNovaRequirements/images/` — copied diagrams (if you passed `-d`).

Next steps after generating the HTML

- Review `requirements-mapping.html` and confirm per-workstream tables look correct.
- I can then ingest that HTML (or the workbook directly) to embed mapping rows into per-phase technical pages and expand the Phase 2..5 docs.