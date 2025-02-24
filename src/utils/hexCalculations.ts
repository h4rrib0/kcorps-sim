// src/utils/hexCalculations.ts

export type TerrainType = 'blank' | 'locale' | 'mountain' | 'water';

export interface HexCoord {
  q: number;  // axial coordinates
  r: number;
}

// Convert axial coordinates to pixel positions
export function hexToPixel(hex: HexCoord, size: number): { x: number; y: number } {
  const y = size * (Math.sqrt(3) * hex.r + Math.sqrt(3) / 2 * hex.q);
  const x = size * (3/2 * hex.q);
  return { x, y };
}

// Generate points for a hexagon path
export function hexagonPoints(size: number): string {
  const angles = Array.from({ length: 6 }, (_, i) => i * 60);
  return angles
    .map(angle => {
      const radian = (Math.PI / 180) * angle;
      const x = size * Math.cos(radian);
      const y = size * Math.sin(radian);
      return `${x},${y}`;
    })
    .join(' ');
}

// Get coordinates for all hexes in a grid of given radius
export function generateHexGrid(radius: number): HexCoord[] {
  const hexes: HexCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      hexes.push({ q, r });
    }
  }
  return hexes;
}