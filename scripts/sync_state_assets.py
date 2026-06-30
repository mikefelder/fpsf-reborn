#!/usr/bin/env python3
"""Sync assets from all timestamps in a state group into shared-assets.

Reads ../fpsf-archivist/states-<year>.json, finds the named state, walks
its html_timestamps + asset_timestamps in order (canonical first), and
copies all asset files into public/shared-assets/<year>/. The canonical
timestamp wins for any file present in multiple timestamps.

Usage:
  python3 scripts/sync_state_assets.py 2011 main
  python3 scripts/sync_state_assets.py 2014 blind-presale --dry-run

The script never overwrites existing target files. To force re-sync of a
single year, delete public/shared-assets/<year>/ first.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path


ASSET_EXTENSIONS = {
    ".css", ".js", ".json", ".xml",
    ".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico", ".webp",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    ".pdf", ".mp4", ".m4v", ".webm", ".mov",
}


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def archivist_root() -> Path:
    return repo_root().parent / "fpsf-archivist"


def load_state(year: str, state_name: str) -> dict:
    states_file = archivist_root() / f"states-{year}.json"
    if not states_file.exists():
        sys.exit(f"Missing {states_file}")
    data = json.loads(states_file.read_text(encoding="utf-8"))
    for state in data.get("states", []):
        if state["name"] == state_name:
            return state
    sys.exit(f"State '{state_name}' not found in {states_file}")


def is_asset_file(path: Path) -> bool:
    if path.name.startswith("."):
        return False
    return path.suffix.lower() in ASSET_EXTENSIONS


def sync_state(year: str, state_name: str, dry_run: bool) -> dict:
    state = load_state(year, state_name)
    canonical = state["canonical"]
    ordered_timestamps = [canonical] + [
        ts for ts in (state.get("html_timestamps", []) + state.get("asset_timestamps", []))
        if ts != canonical
    ]

    target_root = repo_root() / "public" / "shared-assets" / year
    archivist = archivist_root()

    copied: list[tuple[str, str]] = []
    skipped_existing: list[str] = []
    not_found: list[str] = []
    by_source: dict[str, int] = {}

    if not dry_run:
        target_root.mkdir(parents=True, exist_ok=True)

    for ts in ordered_timestamps:
        source_root = archivist / "raw" / year / ts
        if not source_root.exists():
            not_found.append(ts)
            continue
        for source_path in source_root.rglob("*"):
            if not source_path.is_file() or not is_asset_file(source_path):
                continue
            rel = source_path.relative_to(source_root)
            target_path = target_root / rel
            if target_path.exists():
                skipped_existing.append(str(rel))
                continue
            copied.append((str(rel), ts))
            by_source[ts] = by_source.get(ts, 0) + 1
            if not dry_run:
                target_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source_path, target_path)

    return {
        "year": year,
        "state": state_name,
        "canonical": canonical,
        "timestamps_considered": len(ordered_timestamps),
        "timestamps_missing_on_disk": not_found,
        "files_copied": len(copied),
        "files_skipped_existing": len(skipped_existing),
        "files_by_source_timestamp": by_source,
        "mode": "dry_run" if dry_run else "write",
        "target": str(target_root.relative_to(repo_root())),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("year", help="Show year (e.g. 2011)")
    parser.add_argument("state", help="State name (e.g. main, presale, lineup)")
    parser.add_argument("--dry-run", action="store_true", help="Report what would be copied without writing")
    args = parser.parse_args()

    report = sync_state(args.year, args.state, dry_run=args.dry_run)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
