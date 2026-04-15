#!/usr/bin/env python3
"""
Generate phonics audio files using Kokoro TTS.
Edit the PHONICS dict below to change how any letter sounds.

Prerequisites:
    sudo apt-get install -y espeak-ng
    pip install kokoro soundfile torch

Usage:
    python3 scripts/generate_phonics.py

Output: app/www/sounds/phonics/A.mp3 through Z.mp3
"""

from kokoro import KPipeline
import soundfile as sf
import subprocess
import os
import numpy as np
import sys

# ---------------------------------------------------------------------------
# Edit these!  The key is the filename, the value is what Kokoro will say.
#
# For continuous sounds (fff, sss, etc.) we use longer text to get a
# natural sustained sound instead of a quick stutter.
# For plosive consonants (b, d, g, p, t, k) we add a following vowel
# to get the proper phonics sound.
# ---------------------------------------------------------------------------
PHONICS = {
    'A': 'ah',          
    'B': 'buh',         
    'C': 'kuh',         
    'D': 'duh',         
    'E': 'eh',          
    'F': 'eff',       
    'G': 'guh',         
    'H': 'huh',         
    'I': 'ih',          
    'J': 'juh',         
    'K': 'kuh',         
    'L': 'luh',         
    'M': 'muh',         
    'N': 'nuh',         
    'O': 'ah',          
    'P': 'puh',         
    'Q': 'kwuh',        
    'R': 'ruh',         
    'S': 'ess',         
    'T': 'tuh',         
    'U': 'uh',          
    'V': 'vuh',         
    'W': 'wuh',         
    'X': 'ex',          
    'Y': 'yuh',         
    'Z': 'zuh',         
}
# ---------------------------------------------------------------------------

# Voice: af_heart is the default American English female voice
# Others: af_bella, am_adam, am_michael, bf_emma, bm_george
VOICE = 'af_heart'
LANG_CODE = 'a'  # 'a' = American English, 'b' = British English

# Sample rate for Kokoro
SAMPLE_RATE = 24000

# Output directory (relative to this script's parent)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "app", "www", "sounds", "phonics")

# Temp dir for WAV files before MP3 conversion
TEMP_DIR = os.path.join(SCRIPT_DIR, ".temp-phonics")


def generate(pipeline, letter, text):
    """Synthesize one letter's phonics sound and save as MP3."""
    all_audio = []

    for graphemes, phonemes, audio in pipeline(text, voice=VOICE, speed=0.9):
        all_audio.append(audio)

    if not all_audio:
        print(f"  ⚠  {letter}: '{text}' — NO AUDIO GENERATED")
        return False

    # Concatenate all audio chunks
    audio_data = np.concatenate(all_audio)

    wav_path = os.path.join(TEMP_DIR, f"{letter}.wav")
    mp3_path = os.path.join(OUTPUT_DIR, f"{letter}.mp3")

    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Write WAV
    sf.write(wav_path, audio_data, SAMPLE_RATE)

    # Convert to MP3 using lame
    subprocess.run(
        ["lame", "--quiet", "--preset", "medium", wav_path, mp3_path],
        check=True,
    )

    # Clean up WAV
    os.remove(wav_path)

    duration_ms = len(audio_data) / SAMPLE_RATE * 1000
    file_size = os.path.getsize(mp3_path)
    print(f"  ✓  {letter}: '{text}' → {file_size} bytes, {duration_ms:.0f}ms")
    return True


def main():
    print(f"Loading Kokoro TTS with voice '{VOICE}'...")
    pipeline = KPipeline(lang_code=LANG_CODE)
    print(f"Sample rate: {SAMPLE_RATE}\n")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(TEMP_DIR, exist_ok=True)

    success = 0
    for letter, text in PHONICS.items():
        if generate(pipeline, letter, text):
            success += 1

    # Clean up temp dir
    if os.path.exists(TEMP_DIR):
        os.rmdir(TEMP_DIR)

    print(f"\nDone — {success}/26 files generated to {OUTPUT_DIR}")

    # List any that failed
    failed = [l for l in PHONICS if not os.path.exists(os.path.join(OUTPUT_DIR, f"{l}.mp3"))]
    if failed:
        print(f"Missing files: {', '.join(failed)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
