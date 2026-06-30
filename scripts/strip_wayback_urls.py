#!/usr/bin/env python3
"""Strip Wayback Machine URL prefixes from all text-based assets.

Walks a target directory for files with text-like extensions, finds
Wayback Machine URL prefixes, and rewrites them in two ways:

1. If the underlying URL points at fpsf.com / freepresssummerfest.com
   (any host variant), the whole reference becomes
   `/shared-assets/<year>/<path>` so the browser loads the locally
   recovered copy instead of an archive URL.
2. Otherwise (Google fonts, Vimeo, Twitter widgets, etc.) the Wayback
   prefix is stripped and the original target URL is preserved as-is.

Also deletes files mis-saved with a binary extension (.png, .jpg, etc.)
that actually contain a Wayback HTML error/wrapper page.

The script defaults to `public/shared-assets/` in the workspace it is
invoked from. Run with `--dry-run` to preview without writing.

Usage:
  python3 scripts/strip_wayback_urls.py
  python3 scripts/strip_wayback_urls.py --dry-run
  python3 scripts/strip_wayback_urls.py --root /path/to/dir
  python3 scripts/strip_wayback_urls.py --no-delete-corrupt
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
from collections import Counter, defaultdict
from pathlib import Path


TEXT_EXTENSIONS = {
    ".css", ".js", ".mjs", ".cjs", ".json", ".xml", ".html", ".htm", ".svg",
    ".txt", ".astro", ".tsx", ".ts", ".jsx", ".md",
}

BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    ".pdf", ".mp4", ".m4v", ".webm", ".mov", ".zip",
}

# https://web.archive.org/web/<ts>[modifier]/  OR  /web/<ts>[modifier]/
WAYBACK_ABS_RE = re.compile(
    r"https?://web\.archive\.org/web/(\d{8,14})([a-z_]*)/",
    re.IGNORECASE,
)
WAYBACK_REL_RE = re.compile(
    r"/web/(\d{8,14})([a-z_]*)/",
    re.IGNORECASE,
)
# Malformed prefix that Wayback's URL rewriter sometimes leaves behind inside
# inline JS string literals: `//web.archive.orghttp://www.google-analytics...`
WAYBACK_BROKEN_RE = re.compile(
    r"//web\.archive\.org(?=https?:)",
    re.IGNORECASE,
)

# Wombat is Wayback's JS sandbox that rewrites globalThis access. When Wayback
# serves a captured .js file it wraps the original code in a header + footer.
WOMBAT_HEADER_RE = re.compile(
    r"^var _____WB\$wombat\$assign\$function_____.*?let opener = _____WB\$wombat\$assign\$function_____\(\"opener\"\);\s*",
    re.DOTALL,
)
WOMBAT_FOOTER_RE = re.compile(
    r"}?\s*/\*\s*(?:FILE ARCHIVED ON|playback timings).*?\*/\s*$",
    re.DOTALL,
)
WOMBAT_HEADER_SIGNATURE = b"var _____WB$wombat$assign$function_____"

FPSF_HOSTS = {
    "fpsf.com",
    "www.fpsf.com",
    "freepresssummerfest.com",
    "www.freepresssummerfest.com",
}

HTML_HEAD_SIGNATURES = (
    b"<!doctype html",
    b"<!DOCTYPE html",
    b"<html",
    b"<HTML",
    b"<?xml version",  # Wayback sometimes serves XML errors
)


def year_for_file(path: Path, root: Path) -> str | None:
    """Walk parents looking for a 4-digit segment under root."""
    rel = path.relative_to(root)
    for part in rel.parts:
        if len(part) == 4 and part.isdigit():
            return part
    return None


def is_corrupt_binary(path: Path) -> bool:
    """Binary-extension files that contain HTML/Wayback wrappers are corrupt."""
    if path.suffix.lower() not in BINARY_EXTENSIONS:
        return False
    try:
        with path.open("rb") as f:
            head = f.read(512)
    except Exception:
        return False
    head_lower = head.lstrip().lower()
    return any(head_lower.startswith(sig.lower()) for sig in HTML_HEAD_SIGNATURES)


HTML_INSIDE_WOMBAT_RE = re.compile(r"<(?:!doctype|html|head|body)\b", re.IGNORECASE)


def classify_wombat_wrapped(text: str) -> str:
    """Decide whether a wombat-wrapped JS file holds real JS or a 404 HTML page.

    Returns one of: 'js' (real JS, strip wrapper), 'html' (corrupt, delete), 'none'
    (no wombat header found).
    """
    if WOMBAT_HEADER_SIGNATURE.decode() not in text[:512]:
        return "none"
    # Peek at content after the wombat header to decide
    m = WOMBAT_HEADER_RE.match(text)
    if not m:
        return "none"
    body = text[m.end():m.end() + 4096]
    if HTML_INSIDE_WOMBAT_RE.search(body):
        return "html"
    return "js"


def strip_wombat_wrapper(text: str) -> str:
    """Remove Wayback's wombat header and trailing FILE ARCHIVED ON footer from JS."""
    text = WOMBAT_HEADER_RE.sub("", text, count=1)
    text = WOMBAT_FOOTER_RE.sub("", text, count=1)
    return text


def rewrite_url_target(target_after_prefix: str, year: str | None,
                       target_mode: str = "served") -> str:
    """Decide what to substitute for the URL that followed the Wayback prefix.

    target_mode == 'served' (default): for fpsf.com/freepresssummerfest.com
    hosts, rewrite to /shared-assets/<year>/<path> so the reborn site serves
    a local copy. External URLs are returned unchanged (prefix stripped).

    target_mode == 'raw': always return the original underlying URL
    unchanged. Used when cleaning archivist raw/ source where we want to
    preserve the original capture URLs without rewriting hosts.
    """
    if not target_after_prefix:
        return ""
    # Handle mailto:/tel: variants that show up after stripping the prefix
    if target_after_prefix.startswith(("mailto:", "tel:", "javascript:", "#", "data:")):
        return target_after_prefix
    # If it doesn't look like an absolute URL, just hand it back
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", target_after_prefix):
        return target_after_prefix

    if target_mode == "raw":
        return target_after_prefix

    try:
        parsed = urllib.parse.urlparse(target_after_prefix)
    except Exception:
        return target_after_prefix

    host = parsed.netloc.lower().split(":", 1)[0]
    path = parsed.path or "/"

    if host in FPSF_HOSTS and year:
        # Rewrite to local /shared-assets/<year>/<path>
        local_path = path.lstrip("/")
        query = f"?{parsed.query}" if parsed.query else ""
        fragment = f"#{parsed.fragment}" if parsed.fragment else ""
        return f"/shared-assets/{year}/{local_path}{query}{fragment}"

    # External host - drop the Wayback prefix only, keep the original URL
    return target_after_prefix


def make_substitution(match: re.Match, text: str, year: str | None,
                      counters: Counter) -> str:
    """Compute what to replace the Wayback prefix with.

    Each regex match has just consumed the prefix portion. We then need
    to peek ahead in the original text at what URL followed, because the
    re.sub call only sees the matched prefix. Instead we do this inside
    a single-pass scan via finditer + custom join below.
    """
    raise NotImplementedError("see process_text below")


# Characters that terminate a URL inside a typical CSS/JS/HTML context.
URL_STOP_CHARS = set(' \t\n\r\'")(>')


def find_url_end(text: str, start: int) -> int:
    """Find where the URL that starts at `start` ends in `text`."""
    i = start
    n = len(text)
    while i < n and text[i] not in URL_STOP_CHARS:
        i += 1
    return i


def process_text(text: str, year: str | None,
                 target_mode: str = "served") -> tuple[str, dict]:
    """Single-pass rewrite of Wayback prefixes in a text blob."""
    out: list[str] = []
    i = 0
    rewrites = 0
    local_rewrites = 0
    external_rewrites = 0
    stripped_only = 0

    while i < len(text):
        m_abs = WAYBACK_ABS_RE.search(text, i)
        m_rel = WAYBACK_REL_RE.search(text, i)

        candidates = [m for m in (m_abs, m_rel) if m is not None]
        if not candidates:
            out.append(text[i:])
            break

        m = min(candidates, key=lambda x: x.start())
        # Emit text up to the prefix
        out.append(text[i:m.start()])
        # Find where the URL that followed the prefix ends
        url_start = m.end()
        url_end = find_url_end(text, url_start)
        target = text[url_start:url_end]
        rewritten = rewrite_url_target(target, year, target_mode=target_mode)
        out.append(rewritten)
        rewrites += 1
        if rewritten.startswith("/shared-assets/"):
            local_rewrites += 1
        elif rewritten == target:
            stripped_only += 1
        else:
            external_rewrites += 1
        i = url_end

    new_text = "".join(out)

    # Second pass: nuke the broken `//web.archive.orghttp` fragments that
    # Wayback's URL rewriter sometimes leaves behind inside inline strings.
    new_text, broken_count = WAYBACK_BROKEN_RE.subn("", new_text)
    rewrites += broken_count
    stripped_only += broken_count

    return new_text, {
        "rewrites": rewrites,
        "local": local_rewrites,
        "external_stripped": stripped_only,
        "external_other": external_rewrites,
    }


def gather_files(root: Path) -> list[Path]:
    paths: list[Path] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if path.name.startswith("."):
            continue
        suffix = path.suffix.lower()
        if suffix in TEXT_EXTENSIONS or suffix in BINARY_EXTENSIONS:
            paths.append(path)
    return paths


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path,
                        default=Path("public/shared-assets"),
                        help="Directory to scan (default: public/shared-assets)")
    parser.add_argument("--target", choices=("served", "raw"), default="served",
                        help="served (rewrite fpsf URLs to /shared-assets/<year>/...) "
                             "or raw (strip Wayback prefix only, preserve original URL).")
    parser.add_argument("--dry-run", action="store_true",
                        help="Report changes without writing")
    parser.add_argument("--no-delete-corrupt", action="store_true",
                        help="Skip deletion of HTML-mislabeled binary files")
    parser.add_argument("--report", type=Path,
                        help="Optional path to write JSON report")
    args = parser.parse_args()

    root: Path = args.root.resolve()
    if not root.exists():
        sys.exit(f"Root not found: {root}")

    print(f"Scanning {root} (dry_run={args.dry_run})")
    files = gather_files(root)

    rewritten_files: list[dict] = []
    deleted_files: list[dict] = []
    totals = Counter()
    by_year: dict[str, Counter] = defaultdict(Counter)

    for path in files:
        year = year_for_file(path, root)

        # Corrupt binary check
        if is_corrupt_binary(path):
            deleted_files.append({
                "path": str(path.relative_to(root.parent)),
                "year": year,
                "size": path.stat().st_size,
            })
            totals["files_deleted"] += 1
            if args.dry_run or args.no_delete_corrupt:
                continue
            path.unlink()
            continue

        if path.suffix.lower() not in TEXT_EXTENSIONS:
            continue

        try:
            text = path.read_text(encoding="utf-8")
            source_encoding = "utf-8"
        except UnicodeDecodeError:
            # Some archived JS/CSS is Latin-1 (e.g. cufon fonts with copyright glyphs).
            try:
                text = path.read_text(encoding="latin-1")
                source_encoding = "latin-1"
            except Exception:
                continue

        # JS-file wombat handling: detect wombat wrapper, classify, act accordingly.
        wombat_kind = classify_wombat_wrapped(text) if path.suffix.lower() in {".js", ".mjs", ".cjs"} else "none"
        if wombat_kind == "html":
            # File is an HTML 404 page mis-saved with a .js extension - delete it.
            deleted_files.append({
                "path": str(path.relative_to(root.parent)),
                "year": year,
                "size": path.stat().st_size,
                "reason": "wombat-wrapped html under .js extension",
            })
            totals["files_deleted"] += 1
            if not args.dry_run:
                path.unlink()
            continue
        if wombat_kind == "js":
            text = strip_wombat_wrapper(text)
            totals["wombat_unwrapped"] += 1

        if "web/" not in text and "web.archive" not in text:
            # Wombat may have been the only thing to clean.
            if wombat_kind == "js":
                if not args.dry_run:
                    path.write_text(text, encoding=source_encoding)
                rewritten_files.append({
                    "path": str(path.relative_to(root.parent)),
                    "year": year,
                    "rewrites": 0,
                    "local": 0,
                    "external_stripped": 0,
                    "external_other": 0,
                    "wombat_unwrapped": True,
                })
                totals["files_rewritten"] += 1
            continue

        new_text, stats = process_text(text, year, target_mode=args.target)
        if stats["rewrites"] == 0:
            continue

        rewritten_files.append({
            "path": str(path.relative_to(root.parent)),
            "year": year,
            **stats,
        })
        totals["files_rewritten"] += 1
        for k, v in stats.items():
            totals[k] += v
            if year:
                by_year[year][k] += v

        if args.dry_run:
            continue
        path.write_text(new_text, encoding=source_encoding)

    print(f"\nFiles scanned: {len(files)}")
    print(f"Files rewritten: {totals['files_rewritten']}")
    print(f"Files deleted (corrupt binary or wombat-html): {totals['files_deleted']}")
    print(f"Wombat wrappers stripped from real JS: {totals['wombat_unwrapped']}")
    print(f"Total URL substitutions: {totals['rewrites']}")
    print(f"  -> local /shared-assets/...: {totals['local']}")
    print(f"  -> external URL preserved : {totals['external_stripped']}")
    print(f"  -> other rewrite          : {totals['external_other']}")
    if by_year:
        print("\nBy year:")
        for year in sorted(by_year):
            stats = by_year[year]
            print(f"  {year}: rewrites={stats['rewrites']:>4}  "
                  f"local={stats['local']:>4}  external={stats['external_stripped']:>4}")

    if args.report:
        report = {
            "root": str(root),
            "mode": "dry_run" if args.dry_run else "write",
            "totals": dict(totals),
            "by_year": {y: dict(c) for y, c in by_year.items()},
            "rewritten_files": rewritten_files,
            "deleted_files": deleted_files,
        }
        args.report.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"\nWrote {args.report}")


if __name__ == "__main__":
    main()
