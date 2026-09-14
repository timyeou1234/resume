#!/usr/bin/env python3
"""Original, softly synthesized ambient score. No third-party samples or recording."""
from pathlib import Path
import json
import numpy as np
from scipy import signal
from scipy.io import wavfile
BASE=Path(__file__).resolve().parent
(BASE/'qa').mkdir(parents=True,exist_ok=True)
SR=48000;DURATION=24.;N=int(SR*DURATION)
rng=np.random.default_rng(46217);audio=np.zeros((N,2),np.float64)
def midi(n):return 440*2**((n-69)/12)
def add(s,start,amp=1,pan=0):
    i=round(start*SR)
    if i>=N:return
    if i<0:s=s[-i:];i=0
    n=min(len(s),N-i);angle=(pan+1)*np.pi/4
    audio[i:i+n,0]+=s[:n]*amp*np.cos(angle)
    audio[i:i+n,1]+=s[:n]*amp*np.sin(angle)
def soft_key(note,start,amp=.055,pan=0):
    t=np.arange(int(SR*2.9))/SR;f=midi(note)
    e=(1-np.exp(-t*75))*np.exp(-t*1.65)
    s=(np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*2*f*t)*np.exp(-t*2)+.065*np.sin(2*np.pi*3*f*t)*np.exp(-t*3))*e
    add(s,start,amp,pan)
    for delay,scale in [(0.19,.16),(.38,.095),(.57,.045)]:add(s,start+delay,amp*scale,-pan)
chords=[[50,57,60,64,65],[46,53,57,60,62],[53,60,64,67,69],[48,55,58,62,65]]
for ci,notes in enumerate(chords):
    t=np.arange(round(SR*7.8))/SR
    e=np.minimum(1,t/.85)*np.minimum(1,np.maximum(0,7.8-t)/2.25)
    for j,n in enumerate(notes):
        f=midi(n);p=rng.random()*6.28
        s=(np.sin(2*np.pi*f*t+p)+.3*np.sin(2*np.pi*f*1.0008*t+p))*.5
        add(s*e,ci*6,.013,pan=(j-2)/4)
    phrase=[notes[2]+12,notes[3]+12,notes[4]+12,notes[1]+12,notes[3]+12,notes[2]+12]
    for j,n in enumerate(phrase):soft_key(n,ci*6+.32+j*.82,.033 if j%2 else .043,(-1)**j*.32)
# Minimal, breath-like transitions; no imitation of recorded app clicks.
sos=signal.butter(2,[700,4200],fs=SR,btype='band',output='sos')
for start in [2.88,6.25,9.95,14.04,18.38,21.60]:
    t=np.arange(int(SR*.65))/SR;e=np.sin(np.pi*t/.65)**2
    s=signal.sosfilt(sos,rng.standard_normal(len(t)))*e
    add(s,start-.23,.012,pan=.05)
for k,start in enumerate([6.95,7.18,7.41]):soft_key([74,77,81][k],start,.020,pan=[-.35,0,.35][k])
soft_key(74,22.02,.055,-.1);soft_key(81,22.14,.035,.1)
t=np.arange(N)/SR;fade=np.minimum(1,t/.50)*np.minimum(1,np.maximum(0,24-t)/1.55)
audio*=fade[:,None]
peak=float(np.abs(audio).max());audio*=.50/max(peak,1e-8)
audio=np.tanh(audio)*.87
wavfile.write(BASE/'score.wav',SR,np.round(audio*32767).astype(np.int16))
(BASE/'qa'/'audio.json').write_text(json.dumps({'duration':DURATION,'sampleRate':SR,'channels':2,'peakDBFS':float(20*np.log10(np.abs(audio).max())),'rmsDBFS':float(20*np.log10(np.sqrt(np.mean(audio**2)))),'provenance':'Original procedural synthesis. No external samples.'},indent=2))
print('AUDIO_OK')
