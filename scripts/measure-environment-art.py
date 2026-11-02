"""Read-only atlas measurement. Requires Pillow only when remeasuring new source art."""
from collections import deque
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
image = Image.open(root / 'assets/art/environment-v4.png').convert('RGBA')
width, height = image.size
alpha = image.getchannel('A').tobytes()
seen = bytearray(width * height)
components = []
for start in range(width * height):
    if seen[start] or alpha[start] < 96:
        continue
    queue = deque([start])
    seen[start] = 1
    x0 = x1 = start % width
    y0 = y1 = start // width
    count = 0
    while queue:
        index = queue.popleft()
        x, y = index % width, index // width
        x0, x1, y0, y1 = min(x0, x), max(x1, x), min(y0, y), max(y1, y)
        count += 1
        neighbours = []
        if x: neighbours.append(index - 1)
        if x + 1 < width: neighbours.append(index + 1)
        if y: neighbours.append(index - width)
        if y + 1 < height: neighbours.append(index + width)
        for neighbour in neighbours:
            if not seen[neighbour] and alpha[neighbour] >= 96:
                seen[neighbour] = 1
                queue.append(neighbour)
    if count > 4000:
        components.append((x0, y0, x1 + 1, y1 + 1))

if len(components) != 16:
    raise RuntimeError(f'Expected 16 separate props; found {len(components)}. Inspect source art.')

# The generated art has unequal row heights. Measure actual object regions rather
# than treating nominal 4x4 cells as exact and cutting roots or roofs off.
components.sort(key=lambda bounds: (bounds[1] + bounds[3]) / 2)
ordered = []
for row in range(4):
    ordered.extend(sorted(components[row * 4:row * 4 + 4], key=lambda bounds: bounds[0]))
names = ['pine', 'oak', 'snowpine', 'cottage', 'mossrock', 'snowrock', 'barrel', 'crates',
         'stall', 'wagon', 'portal', 'crystals', 'chest', 'totem', 'stump', 'fence']
frames = {}
for name, (x0, y0, x1, y1) in zip(names, ordered):
    bottom = range(max(y0, y1 - max(3, int((y1 - y0) * .06))), y1)
    foot_pixels = [x for y in bottom for x in range(x0, x1) if alpha[y * width + x] >= 128]
    foot_x = sum(foot_pixels) / len(foot_pixels) if foot_pixels else (x0 + x1) / 2
    left, top = max(0, x0 - 1), max(0, y0 - 1)
    right, bottom_y = min(width, x1 + 1), min(height, y1 + 1)
    frames[name] = {'x': left, 'y': top, 'w': right - left, 'h': bottom_y - top,
                    'pivot': [round((foot_x - left) / (right - left), 5), 0]}

destination = root / 'assets/art/environment-v4.frames.json'
destination.write_text(json.dumps({'width': width, 'height': height, 'frames': frames}, indent=2) + '\n')
print(f'Measured {len(frames)} object regions in {width}x{height}; source PNG unchanged.')
