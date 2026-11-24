"""Trims and shrinks new AI portraits (spec 011): run after `npm run portraits:paint`.

FLUX often paints fake artist signatures in the corners. This crops the edges (8% on the
sides, 4% at the top, 12% at the bottom), resizes to 768 x 768 and saves as WebP (~50 KB
instead of ~650 KB), then deletes the original. Only 1024 x 1024 images under public/images
are touched: .jpg files (what Cloudflare returns) and .png files not yet committed; the
original hand-picked .png portraits (committed) and trimmed .webp files are left alone.

Usage (needs Python 3 and Pillow: `pip install pillow`):
    python scripts/trim-portraits.py            # trim every new portrait
    python scripts/trim-portraits.py --dry-run  # list what would be trimmed
Then run `npm run portraits` to update the list the app reads.
"""
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is missing: run `pip install pillow` first.")

ROOT = Path(__file__).resolve().parent.parent / "public" / "images"
BOX = (82, 41, 942, 901)  # in a 1024 x 1024 image
SIZE = 768


def main() -> None:
    dry_run = "--dry-run" in sys.argv
    committed = set(
        subprocess.run(
            ["git", "ls-files", "public/images"],
            cwd=ROOT.parent.parent,
            capture_output=True,
            text=True,
        ).stdout.split()
    )
    new_png = [
        f
        for f in ROOT.glob("*/*/*1.png")
        if f.relative_to(ROOT.parent.parent).as_posix() not in committed
    ]
    files = sorted([*ROOT.glob("*/*/*1.jpg"), *new_png])
    done = 0
    for file in files:
        with Image.open(file) as image:
            if image.size != (1024, 1024) or file.with_suffix(".webp").exists():
                continue
            print(f"{'would trim' if dry_run else 'trim'} {file.relative_to(ROOT)}")
            if dry_run:
                continue
            trimmed = image.convert("RGB").crop(BOX).resize((SIZE, SIZE), Image.LANCZOS)
            trimmed.save(file.with_suffix(".webp"), "WEBP", quality=82, method=6)
        file.unlink()
        done += 1
    print(f"{done} portrait(s) trimmed." if not dry_run else "Dry run: nothing changed.")


if __name__ == "__main__":
    main()
