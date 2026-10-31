#!/usr/bin/env python3
"""The showcase film's score. Every sound here is synthesized from scratch with numpy (no samples,
no licensed music): small tactile sounds on the film's real events, read from out/cues.json, over a
quiet original bed that starts with the rekenrek's first ten and drops away for the return.

    python3 showcase/sound.py      → showcase/out/score.wav (exactly 75.000 s, 48 kHz, stereo)
"""
import json
import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parent / 'out'
DATA = json.loads((OUT / 'cues.json').read_text())
AT, CUES = DATA['at'], DATA['cues']
LENGTH = AT['end']
N = int(round(LENGTH * SR))
rng = np.random.default_rng(75)

mix = np.zeros((2, N))
stems = {}


def add(sig, t, gain=1.0, pan=0.0):
    """Mix a mono (or stereo) signal in at film time t, panned -1 (left) … 1 (right)."""
    i = int(round(t * SR))
    if i >= N:
        return
    sig = np.atleast_2d(sig)
    if sig.shape[0] == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.vstack([sig[0] * np.cos(a), sig[0] * np.sin(a)]) * np.sqrt(2)
    n = min(sig.shape[1], N - i)
    mix[:, i:i + n] += gain * sig[:, :n]


def time(dur):
    return np.arange(int(dur * SR)) / SR


def tone(f, dur, decay, partials=((1, 1.0),), attack=0.002, glide=None):
    """Struck tone: partials (ratio, level) decaying exponentially, higher ones faster.
    glide: (ratio at end, seconds) bends the pitch, for pops and thuds."""
    t = time(dur)
    if glide:
        r, s = glide
        bend = 1 + (r - 1) * (1 - np.exp(-t / s))
        phase = 2 * np.pi * f * np.cumsum(bend) / SR
    else:
        phase = 2 * np.pi * f * t
    out = np.zeros_like(t)
    for ratio, level in partials:
        out += level * np.sin(phase * ratio) * np.exp(-t / (decay / ratio ** 0.6))
    return out * np.minimum(1, t / attack)


def band(sig, lo, hi):
    """Keep one band of a short signal (FFT mask with soft edges)."""
    spec = np.fft.rfft(sig)
    f = np.fft.rfftfreq(len(sig), 1 / SR)
    mask = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(spec * mask, len(sig))


def click(dur=0.008, lo=2500, hi=9000):
    t = time(dur)
    return band(rng.standard_normal(len(t)), lo, hi) * np.exp(-t / (dur / 4))


def sweep(dur, fc, amp, width=0.5, seed=0):
    """Breath of air through a moving band: fc(u) and amp(u) for u in 0…1 over dur. Stereo."""
    n, hop, size = int(dur * SR), 512, 4096
    win = np.hanning(size)
    out = np.zeros((2, n + size))
    g = np.random.default_rng(seed)
    f = np.fft.rfftfreq(size, 1 / SR)
    for s in range(0, n, hop):
        u = s / n
        c = fc(u)
        shape = np.exp(-0.5 * (np.log(np.maximum(f, 1) / c) / width) ** 2) * amp(u)
        for ch in range(2):
            frame = np.fft.irfft(np.fft.rfft(g.standard_normal(size)) * shape, size) * win
            out[ch, s:s + size] += frame
    return out[:, :n] * (hop / size) * 2


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-12)


def layer(*parts):
    """Sum (level, signal) pairs of any lengths."""
    out = np.zeros(max(len(p) for _, p in parts))
    for g, p in parts:
        out[:len(p)] += g * p
    return out


# ═══════ TACTILE SOUNDS ═══════

def beads(n, last=False):
    """A group of beads sliding home: a short train of clacks, the first the loudest."""
    out = np.zeros(int(0.25 * SR))
    for k in range(n):
        f = 2050 * (1 + 0.035 * rng.standard_normal())
        c = tone(f, 0.2, 0.03 if last else 0.018, ((1, 1), (2.7, 0.35), (5.2, 0.12))) + 0.5 * tone(330, 0.2, 0.03)
        c[:len(click())] += 0.6 * click()
        i = int((k * 0.011 + 0.002 * rng.random()) * SR)
        m = min(len(c), len(out) - i)
        out[i:i + m] += (0.85 ** k) * c[:m]
    return norm(out)


def wood(f, decay=0.04, body=0.5):
    c = tone(f, 0.3, decay, ((1, 1), (1.83, 0.5), (2.9, 0.15))) + body * tone(f * 0.36, 0.3, decay * 1.5)
    c[:len(click(0.006))] += 0.5 * click(0.006, 1500, 7000)
    return norm(c)


def chime(f, decay=0.6, level=1.0):
    return level * norm(tone(f, decay * 5, decay, ((1, 1), (2.0, 0.25), (3.01, 0.08)), attack=0.004))


def ceramic(f):
    c = tone(f, 0.15, 0.02, ((1, 1), (2.32, 0.35), (4.1, 0.1))) + 0.35 * tone(620, 0.15, 0.015)
    c[:len(click(0.004))] += 0.7 * click(0.004, 3500, 12000)
    return norm(c)


def pop(f, up=True):
    c = tone(f, 0.18, 0.045, ((1, 1), (2, 0.2)), attack=0.003, glide=(1.35 if up else 0.75, 0.02))
    c[:len(click(0.003))] += 0.25 * click(0.003, 2000, 8000)
    return norm(c)


PENTA = [0, 2, 4, 7, 9]   # major pentatonic steps


def penta(i, base=440.0):
    o, s = divmod(i, 5)
    return base * 2 ** (o + PENTA[s] / 12)


for c in CUES:
    t, k = c['t'], c['kind']
    if k == 'beads':
        add(beads(c['n'], c.get('last', False)), t, 0.55 if not c.get('last') else 0.6)
    elif k == 'rod':
        add(wood(1700 + 40 * c['k'], 0.012, 0.2), t, 0.08 + 0.012 * c['k'], pan=-0.15)
    elif k == 'gather':
        add(wood(900, 0.05), t, 0.42, pan=-0.15)
    elif k == 'land':
        add(layer((1, norm(tone(170, 0.6, 0.09, ((1, 1), (2.4, 0.3)), glide=(0.85, 0.05)))), (0.3, wood(600, 0.03))), t, 0.38, pan=-0.25)
    elif k == 'exchange':
        add(chime(1318.5, 0.5), t, 0.16, pan=-0.25)
    elif k == 'rush':
        d = c['dur']
        air = sweep(d, lambda u: 260 * (2400 / 260) ** (u ** 1.6),
                    lambda u: np.sin(np.pi * min(1, u / 0.86) / 2) ** 2 * (1 - max(0, (u - 0.86) / 0.14)) ** 2, 0.55, 1)
        add(air, t, 0.20)
        glint = tone(330, d, 99, ((1, 1), (2.01, 0.3)), attack=1.0, glide=(2.0, d * 0.7))
        glint *= np.sin(np.pi * np.clip(time(d) / d, 0, 1)) ** 2
        add(glint, t, 0.035)
    elif k == 'return':
        d = c['dur']
        air = sweep(d, lambda u: 1900 * (420 / 1900) ** u, lambda u: np.sin(np.pi * u) ** 2 * 0.55, 0.6, 2)
        add(air, t, 0.12)
    elif k == 'arrive':
        add(layer((1, chime(880, 0.7)), (0.6, chime(1318.5, 0.5))), t, 0.10)
    elif k == 'place':
        tray_pitch = {'hexagon': 2200, 'star': 2350, 'flower': 2500, 'crystal': 2650, 'butterfly': 2800}[c['tray']]
        add(ceramic(tray_pitch * (1 + 0.04 * ((c['i'] * 7) % 5 - 2) / 2)), t, 0.30, pan=0.3 * np.sin(c['i'] * 1.7))
    elif k == 'lift':
        add(ceramic(1500) if not c.get('deep') else wood(500, 0.03), t, 0.07)
    elif k == 'refuse':
        knock = np.zeros(int(0.4 * SR))
        a, b = tone(330, 0.3, 0.05, ((1, 1), (2.1, 0.2))), tone(285, 0.3, 0.05, ((1, 1), (2.1, 0.2)))
        knock[:len(a)] += a
        knock[int(0.09 * SR):int(0.09 * SR) + len(b)] += 0.8 * b
        add(norm(knock), t, 0.26, pan=0.2)
        add(sweep(0.32, lambda u: 900, lambda u: (1 - u) ** 2, 0.5, 3), t, 0.05)
    elif k == 'turn':
        add(ceramic(3300), t, 0.12, pan=0.25)
    elif k == 'seat':
        snap = layer((1, ceramic(1760)), (0.5, norm(tone(2637, 1.0, 0.22))), (0.4, norm(tone(520, 0.3, 0.04))))
        add(norm(snap), t, 0.5, pan=0.1)
    elif k == 'stack':
        thud = layer((1, norm(tone(140, 0.6, 0.12, ((1, 1), (2.2, 0.25)), glide=(0.88, 0.06)))), (0.35, wood(420, 0.05)))
        add(norm(thud), t, 0.5)
    elif k == 'grab':
        add(ceramic(1900), t, 0.05)
    elif k == 'layer':
        f = penta({'z': 3, 'x': 1, 'y': 2}[c['axis']] + c['v'], 330)
        add(pop(f, c['grow']), t, 0.22, pan={'x': 0.25, 'y': -0.15, 'z': 0}[c['axis']])
    elif k == 'hinge':
        f = 900 + 500 * c['e'] if c['open'] else 1400 - 500 * c['e']
        h = norm(tone(f, 0.12, 0.012, ((1, 1), (2.6, 0.3))))
        h[:len(click(0.01))] += 0.6 * click(0.01, 1200, 5000)
        add(norm(h), t, 0.16)
    elif k == 'flat':
        add(norm(wood(520, 0.05, 0.3)), t, 0.22)
    elif k == 'shut':
        add(norm(layer((1, wood(700, 0.05)), (0.6, tone(240, 0.4, 0.07)))), t, 0.32)
    elif k == 'swish':
        d, s = c['dur'], c['strength']
        add(sweep(d, lambda u: 3800 * (1100 / 3800) ** u, lambda u: np.sin(np.pi * u) ** 3, 0.45, 4), t, 0.22 * s)
    elif k == 'tilt':
        d = c['dur']
        add(sweep(d, lambda u: 1400 * 1.5 ** u, lambda u: np.sin(np.pi * u) ** 2 * 0.5, 0.35, 5), t, 0.05)
    elif k == 'set':
        add(layer((1, ceramic(2400)), (0.4, chime(1760, 0.4))), t, 0.16)

stems['cues'] = mix.copy()
mix[:] = 0

# ═══════ THE BED ═══════
# 100 bpm from the rekenrek's ten; I–vi–IV–V in D, one bar each. It drops away for the return.
BEAT, START, STOP = 0.6, 2.98, AT['ret']
CHORDS = [(146.83, [0, 4, 7]), (123.47, [0, 3, 7]), (98.0, [0, 4, 7]), (110.0, [0, 4, 7])]   # D, Bm, G, A (roots)


def level(t):
    """How present the bed is: in under the rekenrek, back under the flight and the fumble, rounder
    and lower for the solids, thinning out for the slice, gone for the return."""
    keys = [(START, 0.0), (START + 2.0, 1.0), (AT['placeValue'] + 3.8, 1.0), (AT['placeValue'] + 4.6, 0.55),
            (AT['placeValue'] + 12.7, 0.55), (AT['pattern'], 0.85), (AT['pattern'] + 8.6, 0.85),
            (AT['pattern'] + 8.75, 0.25), (AT['pattern'] + 9.6, 0.85), (AT['slicing'] + 5.0, 0.8),
            (AT['slicing'] + 6.6, 0.35), (STOP - 1.2, 0.3), (STOP - 0.1, 0.0)]
    ts, vs = zip(*keys)
    return float(np.interp(t, ts, vs))


def register(t):
    return -12 if AT['solids'] <= t < AT['nets'] else 0


kalimba = ((1, 1.0), (3.0, 0.12), (5.4, 0.04))
beat = 0
while START + beat * BEAT < STOP:
    t = START + beat * BEAT
    bar, pos = divmod(beat, 4)
    root, triad = CHORDS[bar % 4]
    lv = level(t)
    if lv > 0.01:
        sparse = t >= AT['nets']
        # the pulse: chord tones climbing through the bar, a softer off-beat between
        steps = [0, 1, 2, 1]
        f = root * 2 * 2 ** ((triad[steps[pos]] + register(t)) / 12)
        if not sparse or pos in (0, 2):
            add(tone(f, 1.2, 0.32, kalimba, attack=0.004), t, 0.075 * lv, pan=-0.2)
        if not sparse and pos in (1, 3):
            add(tone(f * 2 ** (triad[2] / 12), 0.8, 0.2, kalimba, attack=0.004), t + BEAT / 2, 0.03 * lv, pan=0.25)
        # the bass, once a bar
        if pos == 0:
            fb = root   # D3–G2: low enough to hold the floor, high enough for a laptop speaker
            add(tone(fb, 2.6, 0.9, ((1, 1), (2, 0.15)), attack=0.02), t, 0.11 * lv)
            # the pad: a quiet chord, slow in and out, held for the bar
            n = int(BEAT * 4.6 * SR)
            env = np.minimum(1, np.arange(n) / (0.6 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.8 * SR))
            for semi in triad:
                fp = root * 2 * 2 ** ((semi + register(t) / 2) / 12)
                for det, pan in ((0.9985, -0.5), (1.0015, 0.5)):
                    add(np.sin(2 * np.pi * fp * det * np.arange(n) / SR) * env, t, 0.012 * lv, pan=pan)
    beat += 1

# ═══════ THE END CARD ═══════
# one chord, arriving with the words and decaying away by the last frame
t = CUES[-1]['t'] if CUES[-1]['kind'] == 'card' else AT['card'] + 0.65
for f, g in ((146.83, 0.5), (293.66, 0.6), (369.99, 0.45), (440.0, 0.4), (587.33, 0.3)):
    add(norm(tone(f, LENGTH - t, 1.3, kalimba, attack=0.06)), t, 0.07 * g)

stems['bed'] = mix.copy()

# ═══════ MASTER ═══════
# The tactile sounds lead: the bed sits a fixed distance under their peaks.
BED_UNDER = 30   # dB from the loudest tactile peak down to the bed's running level


def db(x):
    return 20 * np.log10(x + 1e-12)


active = slice(int(START * SR), int(STOP * SR))
cue_peak = np.max(np.abs(stems['cues']))
bed_rms = np.sqrt(np.mean(stems['bed'][:, active] ** 2))
bed_gain = 10 ** ((db(cue_peak) - BED_UNDER - db(bed_rms)) / 20)
mix = stems['cues'] + bed_gain * stems['bed']
print(f'tactile peak {db(cue_peak):.1f} dB, bed {db(bed_rms):.1f} dB rms → bed gain {db(bed_gain):+.1f} dB')

# fade the last half-second to true silence, soften peaks, and leave headroom
fade = np.ones(N)
k = int(0.5 * SR)
fade[-k:] = np.linspace(1, 0, k) ** 2
mix *= fade
mix = np.tanh(mix * 1.3) / 1.3
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2')
with wave.open(str(OUT / 'score.wav'), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f'score.wav: {N / SR:.3f} s, {len(CUES)} cues')
