#!/usr/bin/env python3
"""Deterministic rendering of the local Canvas composition. No network or Figma writes."""
from pathlib import Path
import argparse, base64, json, re, shutil, subprocess, time
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parent

def document():
    s=(BASE/'stage.html').read_text()
    # Replace only the source-image assignment; all paths are from the local manifest.
    data={p.stem:'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (BASE/'assets').glob('*.png')}
    s=s.replace("i.src=`assets/${name}.png`;",f"i.src=({json.dumps(data)})[name];")
    return s

def run(version,out,start=0,end=None,stills=False):
    end=end or (360 if version=='loop' else 720)
    chrome=shutil.which('chromium') or shutil.which('google-chrome')
    if not chrome:
        mac_chrome=Path('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        if mac_chrome.is_file(): chrome=str(mac_chrome)
    if not chrome:
        raise RuntimeError('Install Chromium or Google Chrome, or set the browser executable path in render.py.')
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=chrome,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page=b.new_page(viewport={'width':1280,'height':720},device_scale_factor=1)
        errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
        page.set_content(document(),wait_until='load');page.wait_for_function('window.__loaded===true')
        spec=page.evaluate('getSpec()')
        if stills:
            out=Path(out);out.mkdir(exist_ok=True,parents=True)
            times=[.9,2.2,4.4,5.4,7.8,9.1,11.8,13.2,16.2,17.6,20.2,23.4] if version=='main' else [0,3,6,9,12]
            for t in times:
                f=round(t*30)
                s=page.evaluate("([f,v])=>{renderFrame(f,v);return document.getElementById('film').toDataURL('image/png').split(',')[1]}",[f,version])
                (out/f'{version}-{f:04}.png').write_bytes(base64.b64decode(s))
            spec['pageErrors']=errors;(out/'composition-spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2))
            b.close();print('STILLS_OK',flush=True);return
        if not shutil.which('ffmpeg'):raise RuntimeError('Install FFmpeg.')
        out=Path(out);out.parent.mkdir(exist_ok=True,parents=True)
        cmd=['ffmpeg','-y','-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-framerate','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',str(out)]
        now=time.monotonic()
        with subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE) as enc:
            try:
                for f in range(start,end):
                    s=page.evaluate("([f,v])=>{renderFrame(f,v);return document.getElementById('film').toDataURL('image/jpeg',.98).split(',')[1]}",[f,version])
                    enc.stdin.write(base64.b64decode(s))
                    if (f-start)%90==0:print(f'{version}: {f}/{end}, {time.monotonic()-now:.1f}s',flush=True)
                enc.stdin.close();enc.stdin=None;_,err=enc.communicate(timeout=90)
                if enc.returncode:raise RuntimeError(err.decode())
            except BaseException:
                enc.kill();raise
        b.close()
        if errors:raise RuntimeError('; '.join(errors))
        print(f'RENDER_OK {out} ({out.stat().st_size} bytes)',flush=True)
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--version',choices=['main','loop'],default='main');ap.add_argument('--out',required=True);ap.add_argument('--start',type=int,default=0);ap.add_argument('--end',type=int);ap.add_argument('--stills',action='store_true');a=ap.parse_args();run(a.version,a.out,a.start,a.end,a.stills)
