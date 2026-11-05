"""Encodes scripts/frames/*.png into public/how-to.webp (animated, small) and public/how-to.gif (fallback). Needs Pillow."""
from pathlib import Path

from PIL import Image

root = Path(__file__).parent
frames = [Image.open(p).convert("RGB").resize((720, 270), Image.Resampling.LANCZOS) for p in sorted((root / "frames").glob("*.png"))]
durations = [120] * len(frames)
durations[-1] = 1600
public = root.parent / "public"
frames[0].save(public / "how-to.webp", save_all=True, append_images=frames[1:], duration=durations, loop=0, quality=72, method=6)
palette = [f.quantize(colors=64, method=Image.Quantize.MEDIANCUT) for f in frames]
palette[0].save(public / "how-to.gif", save_all=True, append_images=palette[1:], duration=durations, loop=0, optimize=True)
for name in ("how-to.webp", "how-to.gif"):
    print(name, (public / name).stat().st_size // 1024, "KB")
