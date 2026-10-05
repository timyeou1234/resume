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
current_manifest = json.loads((repo / "media/portfolio-real-v9/media-manifest.json").read_text())
motion_manifest = json.loads((repo / "media/portfolio-motion-v10/media-manifest.json").read_text())

with tempfile.TemporaryDirectory(prefix="portfolio-manifest-tests-") as directory:
    root = pathlib.Path(directory)
    (root / "site").symlink_to(repo / "site", target_is_directory=True)
    (root / "scripts").mkdir()
    for script in ("validate-site.sh", "build-portfolio.sh"):
        shutil.copyfile(repo / "scripts" / script, root / "scripts" / script)
    (root / "media/portfolio-media-v8").mkdir(parents=True)
    (root / "media/moment").symlink_to(repo / "media/moment", target_is_directory=True)
    target = root / "media/portfolio-media-v8/media-manifest.json"
    current_target = root / "media/portfolio-real-v9/media-manifest.json"
    current_target.parent.mkdir(parents=True)
    current_target.write_text(json.dumps(current_manifest, ensure_ascii=False))
    motion_target = root / "media/portfolio-motion-v10/media-manifest.json"
    motion_target.parent.mkdir(parents=True)
    motion_target.write_text(json.dumps(motion_manifest, ensure_ascii=False))

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
    target.write_text(json.dumps(manifest, ensure_ascii=False))
    current_cases = []
    candidate = copy.deepcopy(current_manifest)
    candidate["assets"].pop()
    current_cases.append(("missing runtime capture", candidate, "Expected exactly the six sourced V9 product assets"))
    candidate = copy.deepcopy(current_manifest)
    candidate["assets"][0]["sha256"] = "0" * 64
    current_cases.append(("altered current screenshot", candidate, "Current asset differs from recorded original"))
    candidate = copy.deepcopy(current_manifest)
    del candidate["assets"][0]["source"]["data"]
    current_cases.append(("missing test-data provenance", candidate, "Missing original asset provenance"))
    candidate = copy.deepcopy(current_manifest)
    candidate["assets"][2]["kind"] = "runtime-screenshot"
    current_cases.append(("artwork misrepresented as a capture", candidate, "Missing original asset provenance"))
    candidate = copy.deepcopy(current_manifest)
    candidate["assets"][0]["transformation"] = "redrawn interface"
    current_cases.append(("reconstructed product UI", candidate, "Missing original asset provenance"))
    candidate = copy.deepcopy(current_manifest)
    del candidate["assets"][0]["width"]
    current_cases.append(("missing image dimensions", candidate, "Missing current asset dimensions"))
    for name, candidate, diagnostic in current_cases:
        current_target.write_text(json.dumps(candidate, ensure_ascii=False))
        result = subprocess.run(["bash", str(root / "scripts/validate-site.sh")], capture_output=True, text=True)
        output = result.stdout + result.stderr
        assert result.returncode != 0 and diagnostic in output, output
        print(f"Rejected: {name}")
    current_target.write_text(json.dumps(current_manifest, ensure_ascii=False))
    motion_cases = []
    candidate = copy.deepcopy(motion_manifest)
    candidate["assets"].pop()
    motion_cases.append(("missing walkthrough capture", candidate, "Expected exactly eight sourced V10 captures"))
    candidate = copy.deepcopy(motion_manifest)
    candidate["assets"][0]["sha256"] = "0" * 64
    motion_cases.append(("altered walkthrough capture", candidate, "V10 capture differs from recorded original"))
    candidate = copy.deepcopy(motion_manifest)
    del candidate["assets"][1]["source"]["harness"]
    motion_cases.append(("unidentified native fixture harness", candidate, "Missing V10 original capture provenance"))
    candidate = copy.deepcopy(motion_manifest)
    candidate["lineExamples"]["classification"] = "live chat recording"
    motion_cases.append(("illustration misrepresented as recording", candidate, "LINE flow must retain"))
    candidate = copy.deepcopy(motion_manifest)
    candidate["scenes"]["moment"] = 1
    motion_cases.append(("walkthrough reduced to static image", candidate, "Missing animated walkthrough"))
    for name, candidate, diagnostic in motion_cases:
        motion_target.write_text(json.dumps(candidate, ensure_ascii=False))
        run(manifest, diagnostic)
        print(f"Rejected: {name}")
    print(f"Valid baseline and {len(cases) + len(current_cases) + len(motion_cases)} rejection scenarios passed")
