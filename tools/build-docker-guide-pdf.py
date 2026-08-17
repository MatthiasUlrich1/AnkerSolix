#!/usr/bin/env python3
"""Build PDF guide from docs/docker-buanet.md (Edge/Chrome headless)."""

from __future__ import annotations

import pathlib
import re
import subprocess
import sys

import markdown

ROOT = pathlib.Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "docker-buanet.md"
PDF_PATH = ROOT / "docs" / "Anker-Solix-buanet-Docker-Anleitung.pdf"
HTML_PATH = ROOT / "docs" / "_docker-buanet-print.html"
REPO_BLOB = "https://github.com/MatthiasUlrich1/ioBroker.anker-solix/blob/main/docs/"

BROWSERS = [
	pathlib.Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
	pathlib.Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
	pathlib.Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
]


def find_browser() -> pathlib.Path:
	for path in BROWSERS:
		if path.is_file():
			return path
	raise SystemExit("Neither Edge nor Chrome found for PDF export.")


def build_html(md_text: str) -> str:
	text = md_text.replace(
		"(../README.md)",
		"(https://github.com/MatthiasUlrich1/ioBroker.anker-solix/blob/main/README.md)",
	)
	text = re.sub(r"\(docker/([^)]+)\)", REPO_BLOB + r"docker/\1)", text)
	body = markdown.markdown(
		text,
		extensions=["tables", "fenced_code", "toc", "nl2br", "sane_lists"],
	)
	return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8"/>
<title>ioBroker.anker-solix – Docker (buanet/iobroker)</title>
<style>
  @page {{ size: A4; margin: 16mm 14mm 18mm 14mm; }}
  html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  body {{
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
    color: #1a1a1a;
  }}
  h1 {{
    font-size: 18pt;
    margin: 0 0 0.6em;
    color: #0b3d5c;
    border-bottom: 2px solid #0b3d5c;
    padding-bottom: 0.25em;
  }}
  h2 {{
    font-size: 13.5pt;
    margin: 1.4em 0 0.5em;
    color: #0b3d5c;
    page-break-after: avoid;
  }}
  h3 {{
    font-size: 11.5pt;
    margin: 1.1em 0 0.4em;
    color: #234;
    page-break-after: avoid;
  }}
  p, li {{ orphans: 3; widows: 3; }}
  a {{ color: #0b5cab; text-decoration: none; }}
  code {{
    font-family: Consolas, "Courier New", monospace;
    font-size: 9pt;
    background: #f3f5f7;
    padding: 0.05em 0.3em;
    border-radius: 3px;
  }}
  pre {{
    background: #f3f5f7;
    border: 1px solid #d8dee4;
    border-radius: 4px;
    padding: 0.7em 0.85em;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    font-size: 8.2pt;
    line-height: 1.35;
    page-break-inside: avoid;
  }}
  pre code {{ background: none; padding: 0; font-size: inherit; }}
  table {{
    border-collapse: collapse;
    width: 100%;
    margin: 0.8em 0 1em;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }}
  th, td {{
    border: 1px solid #c9d1d9;
    padding: 0.4em 0.55em;
    text-align: left;
    vertical-align: top;
  }}
  th {{ background: #e8eef3; color: #0b3d5c; }}
  hr {{ border: none; border-top: 1px solid #ccd; margin: 1.4em 0; }}
  ul, ol {{ padding-left: 1.3em; }}
  .meta {{
    font-size: 9pt;
    color: #555;
    margin-bottom: 1.2em;
  }}
</style>
</head>
<body>
<p class="meta">ioBroker.anker-solix · Anleitung für buanet/iobroker · Stand: Juli 2026<br/>
Quelle: docs/docker-buanet.md im Adapter-Repository</p>
{body}
</body>
</html>
"""


def main() -> int:
	md_text = MD_PATH.read_text(encoding="utf-8")
	HTML_PATH.write_text(build_html(md_text), encoding="utf-8")
	browser = find_browser()
	if PDF_PATH.exists():
		PDF_PATH.unlink()
	cmd = [
		str(browser),
		"--headless=new",
		"--disable-gpu",
		"--no-pdf-header-footer",
		f"--print-to-pdf={PDF_PATH}",
		HTML_PATH.resolve().as_uri(),
	]
	print("Running:", " ".join(cmd), file=sys.stderr)
	result = subprocess.run(cmd, capture_output=True, text=True)
	if result.returncode != 0:
		print(result.stdout, file=sys.stderr)
		print(result.stderr, file=sys.stderr)
		return result.returncode
	if not PDF_PATH.is_file() or PDF_PATH.stat().st_size < 1000:
		print("PDF was not created or is too small.", file=sys.stderr)
		print(result.stdout, file=sys.stderr)
		print(result.stderr, file=sys.stderr)
		return 1
	# Keep HTML optional for preview; remove temp print file
	HTML_PATH.unlink(missing_ok=True)
	print(f"Wrote {PDF_PATH} ({PDF_PATH.stat().st_size} bytes)")
	return 0


if __name__ == "__main__":
	raise SystemExit(main())
