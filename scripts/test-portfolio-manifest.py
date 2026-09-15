#!/usr/bin/env python3
"""Exercise rejection paths in the real portfolio validator without mutating the repo."""
import copy
import json
import pathlib
import shutil
import subprocess
import tempfile

repo = pathlib.Path(__file__).resolve().parents[1]
manifest = json.loads((repo / "media/portfolio-media-v8/media-manifest.json").read_text())

with tempfile.TemporaryDirectory(prefix="portfolio-manifest-tests-") as directory:
    root = pathlib.Path(directory)
    (root / "site").symlink_to(repo / "site", target_is_directory=True)
    (root / "scripts").mkdir()
    for script in ("validate-site.sh", "build-portfolio.sh"):
        shutil.copyfile(repo / "scripts" / script, root / "scripts" / script)
    (root / "media/portfolio-media-v8").mkdir(parents=True)
    (root / "media/moment").symlink_to(repo / "media/moment", target_is_directory=True)
    target = root / "media/portfolio-media-v8/media-manifest.json"

    def run(candidate, diagnostic=None):
        target.write_text(json.dumps(candidate, ensure_ascii=False))
        result = subprocess.run(["bash", str(root / "scripts/validate-site.sh")], capture_output=True, text=True)
        output = result.stdout + result.stderr
        if diagnostic is None:
            assert result.returncode == 0, output
        else:
            assert result.returncode != 0 and diagnostic in output, output

    run(manifest)
    cases = []
    for field in ("display_titles", "displayNames"):
        candidate = copy.deepcopy(manifest)
        candidate[field]["moment"]["en"] = "Life & travel planning"
        cases.append((field, candidate, "Conflicting or incorrect name metadata"))
    candidate = copy.deepcopy(manifest)
    candidate["positioning"]["moment"]["type"] = "personal-development-tool"
    cases.append(("Moment classification", candidate, "Moment metadata must preserve"))
    candidate = copy.deepcopy(manifest)
    candidate["products"]["moment"]["en"]["film"]["path"] = "assets/products/moment/film-en-v7-silent.mp4"
    cases.append(("arbitrary media version", candidate, "Unexpected media version"))
    candidate = copy.deepcopy(manifest)
    del candidate["products"]["timwork"]["zh"]["poster"]
    cases.append(("missing localized poster", candidate, "Expected film, loop and poster"))
    candidate = copy.deepcopy(manifest)
    candidate["products"]["productdev"]["en"]["loop"]["sha256"] = "0" * 64
    cases.append(("incorrect media hash", candidate, "Media hash differs"))
    candidate = copy.deepcopy(manifest)
    del candidate["products"]["productdev"]["en"]["loop"]["sha256"]
    cases.append(("missing media hash", candidate, "Missing required bytes or SHA-256"))
    candidate = copy.deepcopy(manifest)
    candidate["products"]["moment"]["zh"]["film"]["audioTracks"] = 1
    cases.append(("audio regression", candidate, "Selected videos must be silent"))
    candidate = copy.deepcopy(manifest)
    candidate["products"]["moment"]["zh"]["film"]["source"]["sha256"] = "0" * 64
    cases.append(("incorrect source provenance", candidate, "Original film differs"))
    for name, candidate, diagnostic in cases:
        run(candidate, diagnostic)
        print(f"Rejected: {name}")
    print(f"Valid baseline and {len(cases)} rejection scenarios passed")
