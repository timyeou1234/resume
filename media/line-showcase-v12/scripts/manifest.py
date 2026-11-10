import hashlib,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
site=root.parents[1]/'site'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
assets=[]
for edition in ['desktop','mobile']:
 for lang in ['zh','en']:
  for kind,ext in [('film','mp4'),('poster','jpg')]:
   p=site/f'assets/products/line-family-translator/{kind}-{edition}-{lang}-v12.{ext}'
   probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
   video=next(s for s in probe['streams'] if s['codec_type']=='video')
   a={'path':str(p.relative_to(site)),'sha256':sha(p),'bytes':p.stat().st_size,'width':video['width'],'height':video['height']}
   if kind=='film':
    a.update(duration=float(probe['format']['duration']),audioTracks=sum(s['codec_type']=='audio' for s in probe['streams']),videoCodec=video['codec_name'],pixelFormat=video['pix_fmt'])
    assert a['audioTracks']==0 and a['duration']==36
    subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
   assets.append(a)
sources=[{'path':str(p.relative_to(root)),'sha256':sha(p)} for p in [root/'src/Scenes.tsx',root/'src/Composition.tsx',root/'src/Root.tsx',root/'src/capture.json',root/'public/avatar-v9.png',root/'scripts/capture.mjs',root/'scripts/render.sh',root/'package-lock.json']]
manifest={'version':'v12','evidence':'source-worker responses; synthetic conversations; recreated interface; no native LINE recording','outboundNetworkRequests':0,'chapters':[0,7,14,20,28],'sources':sources,'assets':assets}
(root/'media-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Verified four silent films by full decode; manifest written')
