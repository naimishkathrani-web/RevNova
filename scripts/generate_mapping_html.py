#!/usr/bin/env python3
r"""
generate_mapping_html.py

Reads an Excel workbook produced by the mapping generator (RevNova_Mapping_Full.xlsx)
and creates a developer-friendly HTML page at
`docs/RevNovaRequirements/requirements-mapping.html` containing each sheet
rendered as an HTML table. Optionally copies diagrams into
`docs/RevNovaRequirements/images/` so they can be referenced from the HTML.

Usage (PowerShell):
    # Example (use the correct paths on your machine):
    python .\scripts\generate_mapping_html.py -i .\RevNova_Mapping_Full.xlsx
    python .\scripts\generate_mapping_html.py -i .\RevNova_Mapping_Full.xlsx -d "C:/Users/user1/RevNovaRepository/docs/Diagramsms"

Dependencies: pandas, openpyxl
    pip install pandas openpyxl

This script is intentionally simple and produces a single static HTML file.
"""
from pathlib import Path
import argparse
import sys
import pandas as pd
import shutil


HTML_TEMPLATE = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>RevNova Mapping - Developer View</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 20px; }}
    h1,h2 {{ color: #1a1a1a; }}
    .sheet {{ margin-bottom: 40px; }}
    table {{ border-collapse: collapse; width: 100%; max-width: 1200px; }}
    table, th, td {{ border: 1px solid #ddd; }}
    th, td {{ padding: 6px 8px; text-align: left; font-size: 13px; }}
    th {{ background: #f7f7f7; }}
    .images {{ margin-top: 20px; display:flex; gap:16px; flex-wrap:wrap }}
    .images img {{ max-width: 420px; border:1px solid #eee; padding:6px; background:#fff }}
    .meta {{ color:#666; margin-bottom:12px }}
  </style>
</head>
<body>
  <h1>RevNova Mapping - Developer View</h1>
  <p class="meta">Generated from: {workbook_name}</p>
  {sheets_html}
  {images_html}
</body>
</html>
"""


def sheet_to_html(df: pd.DataFrame, name: str) -> str:
    # sanitize column names and convert DataFrame to HTML
    df = df.fillna("")
    table_html = df.to_html(classes='mapping-table', index=False, escape=False)
    return f"<section class=\"sheet\"><h2>{name}</h2>{table_html}</section>"


def main(argv):
    parser = argparse.ArgumentParser(description='Convert mapping Excel workbook to HTML')
    parser.add_argument('-i', '--input', required=True, help='Path to RevNova_Mapping_Full.xlsx')
    parser.add_argument('-o', '--output', default='docs/RevNovaRequirements/requirements-mapping.html', help='Output HTML path')
    parser.add_argument('-d', '--diagrams', help='Optional path to diagrams folder to copy into docs/RevNovaRequirements/images')
    args = parser.parse_args(argv)

    input_path = Path(args.input).resolve()
    output_path = Path(args.output)
    output_dir = output_path.parent

    if not input_path.exists():
        print(f"ERROR: input file not found: {input_path}")
        sys.exit(2)

    output_dir.mkdir(parents=True, exist_ok=True)

    # read all sheets
    try:
        xls = pd.read_excel(input_path, sheet_name=None, engine='openpyxl')
    except Exception as e:
        print("ERROR: failed to read workbook:", e)
        sys.exit(3)

    sheets_html_parts = []
    for sheet_name, df in xls.items():
        sheets_html_parts.append(sheet_to_html(df, sheet_name))

    sheets_html = '\n'.join(sheets_html_parts)

    images_html = ''
    if args.diagrams:
        diag_src = Path(args.diagrams)
        if diag_src.exists() and diag_src.is_dir():
            images_dst = output_dir / 'images'
            images_dst.mkdir(parents=True, exist_ok=True)
            copied = []
            for path in sorted(diag_src.iterdir()):
                if path.suffix.lower() in ['.png', '.jpg', '.jpeg', '.svg', '.gif']:
                    dst = images_dst / path.name
                    shutil.copy2(path, dst)
                    copied.append(dst.name)
            if copied:
                imgs = ''.join([f'<img src="images/{n}" alt="{n}">' for n in copied])
                images_html = f'<section class="sheet"><h2>Diagrams</h2><div class="images">{imgs}</div></section>'
        else:
            print(f"WARNING: diagrams folder does not exist or is not a directory: {diag_src}")

    html = HTML_TEMPLATE.format(workbook_name=input_path.name, sheets_html=sheets_html, images_html=images_html)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"Wrote mapping HTML: {output_path}")
    if images_html:
        print(f"Copied diagrams into: {output_dir / 'images'}")


if __name__ == '__main__':
    main(sys.argv[1:])
