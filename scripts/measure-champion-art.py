"""Read alpha bounds only; original generated PNG pixels are never changed."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'assets' / 'art'
for name in ('champion-v5', 'champion-attack-v5'):
    image = Image.open(root / (name + '.png')).convert('RGBA')
    width, height = image.size
    mask = bytearray(v > 128 for v in image.getchannel('A').get_flattened_data())
    objects = []
    for pixel in range(width * height):
        if not mask[pixel]:
            continue
        mask[pixel] = 0
        queue = [pixel]
        x0, y0, x1, y1, count = width, height, 0, 0, 0
        while queue:
            p = queue.pop()
            x, y = p % width, p // width
            x0, y0, x1, y1 = min(x0, x), min(y0, y), max(x1, x), max(y1, y)
            count += 1
            for neighbor in (p-1 if x else -1, p+1 if x < width-1 else -1,
                             p-width if y else -1, p+width if y < height-1 else -1):
                if neighbor >= 0 and mask[neighbor]:
                    mask[neighbor] = 0
                    queue.append(neighbor)
        if count > 4000:
            objects.append(dict(x=x0, y=y0, w=x1-x0+1, h=y1-y0+1))
    if len(objects) != 32:
        raise ValueError(f'{name}: expected 32 bodies, found {len(objects)}')
    objects.sort(key=lambda f: f['y'] + f['h']/2)
    frames = []
    for row in range(4):
        frames.extend(sorted(objects[row*8:row*8+8], key=lambda f: f['x']))
    (root / (name + '.frames.json')).write_text(json.dumps(frames, indent=2) + '\n')
    print(name, '32 isolated frame rectangles measured')
