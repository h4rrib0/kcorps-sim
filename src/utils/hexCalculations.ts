// src/utils/hexCalculations.ts

export type TerrainType = 'blank' | 'locale' | 'mountain' | 'water' | 'forest' | 'desert' | 'swamp';

export interface HexCoord {
  q: number;  // axial coordinates
  r: number;
}

export interface MapData {
  id: string;
  name: string;
  terrain: Record<string, TerrainType>;
  radius: number;
  description?: string;
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

// Convert axial to cube coordinates
export function axialToCube(hex: HexCoord): { x: number, y: number, z: number } {
  const x = hex.q;
  const z = hex.r;
  const y = -x - z;
  return { x, y, z };
}

// Calculate the distance between two hex coordinates
export function hexDistance(a: HexCoord, b: HexCoord): number {
  // Convert from axial to cube coordinates
  const ac = axialToCube(a);
  const bc = axialToCube(b);
  
  // Calculate distance in cube coordinates
  return Math.max(
    Math.abs(ac.x - bc.x),
    Math.abs(ac.y - bc.y),
    Math.abs(ac.z - bc.z)
  );
}

// Check if a target is within an attack arc from the attacker
export function isInAttackArc(
  attackerQ: number, 
  attackerR: number,
  attackerFacing: number,
  targetQ: number,
  targetR: number,
  arcWidth: number
): boolean {
  // Same tile is always in arc (for melee)
  if (attackerQ === targetQ && attackerR === targetR) {
    return true;
  }

  // Axial coordinates for the center of the tile in front of the attacker
  let frontTileQ = attackerQ;
  let frontTileR = attackerR;

  // Determine the front tile based on facing
  switch (attackerFacing) {
    case 0: // Top
      frontTileR -= 1;
      break;
    case 60: // Top-Right
      frontTileQ += 1;
      frontTileR -= 1;
      break;
    case 120: // Bottom-Right
      frontTileQ += 1;
      break;
    case 180: // Bottom
      frontTileR += 1;
      break;
    case 240: // Bottom-Left
      frontTileQ -= 1;
      frontTileR += 1;
      break;
    case 300: // Top-Left
      frontTileQ -= 1;
      break;
  }

  // For a 60-degree arc, only the front tile is in range
  if (arcWidth <= 60) {
    return frontTileQ === targetQ && frontTileR === targetR;
  }

  // For a 120-degree arc, the front tile and its two neighbors are in range
  if (arcWidth <= 120) {
    // Check if it's the front tile
    if (frontTileQ === targetQ && frontTileR === targetR) {
      return true;
    }

    // Determine the two neighbors based on facing
    let neighbor1Q = frontTileQ;
    let neighbor1R = frontTileR;
    let neighbor2Q = frontTileQ;
    let neighbor2R = frontTileR;

    switch (attackerFacing) {
      case 0: // Top
        neighbor1Q += 1; neighbor1R -= 1; // Top-Right
        neighbor2Q -= 1; // Top-Left
        break;
      case 60: // Top-Right
        neighbor1Q += 1; // Bottom-Right
        neighbor2Q -= 1; neighbor2R -= 1; // Top
        break;
      case 120: // Bottom-Right
        neighbor1Q += 1; neighbor1R -= 1; // Top-Right
        neighbor2R += 1; // Bottom
        break;
      case 180: // Bottom
        neighbor1Q -= 1; neighbor1R += 1; // Bottom-Left
        neighbor2Q += 1; // Bottom-Right
        break;
      case 240: // Bottom-Left
        neighbor1R += 1; // Bottom
        neighbor2Q -= 1; // Top-Left
        break;
      case 300: // Top-Left
        neighbor1Q -= 1; neighbor1R += 1; // Bottom-Left
        neighbor2R -= 1; // Top
        break;
    }

    return (
      (targetQ === neighbor1Q && targetR === neighbor1R) ||
      (targetQ === neighbor2Q && targetR === neighbor2R)
    );
  }

  // For wider arcs, we'd need more complex calculations
  // This is a simplified implementation for 60 and 120-degree arcs
  return false;
}

// Get all coordinates within a given range of a center point
export function getHexesInRange(center: HexCoord, range: number): HexCoord[] {
  const results: HexCoord[] = [];
  
  for (let q = center.q - range; q <= center.q + range; q++) {
    for (let r = center.r - range; r <= center.r + range; r++) {
      const s = -q - r; // Third cube coordinate
      if (Math.abs(center.q - q) + Math.abs(center.r - r) + Math.abs(-center.q - center.r - s) <= range * 2) {
        results.push({ q, r });
      }
    }
  }
  
  return results;
}

// Get all tiles within attack range and arc
export function getAttackableTiles(
  attackerQ: number,
  attackerR: number,
  attackerFacing: number,
  range: number | 'melee',
  arcWidth: number = 60
): HexCoord[] {
  // For melee weapons, we only include the attacker's tile
  if (range === 'melee') {
    // For melee, we ONLY return attacker's own tile
    // This is for co-located units that can attack each other
    return [{ q: attackerQ, r: attackerR }];
  }
  
  // Get all hexes within the range
  const tilesInRange = getHexesInRange({ q: attackerQ, r: attackerR }, range);
  
  // Filter to only tiles within the attack arc
  return tilesInRange.filter(tile => 
    isInAttackArc(attackerQ, attackerR, attackerFacing, tile.q, tile.r, arcWidth)
  );
}

// Get all tiles for special move targeting
export function getSpecialMoveTargets(
  sourceQ: number,
  sourceR: number,
  sourceFacing: number,
  targeting: 'self' | 'ally' | 'enemy' | 'area',
  range?: number
): HexCoord[] {
  // For 'self' targeting, only include the source tile
  if (targeting === 'self') {
    return [{ q: sourceQ, r: sourceR }];
  }
  
  // For area targeting with a range
  if (targeting === 'area' && range !== undefined) {
    return getHexesInRange({ q: sourceQ, r: sourceR }, range);
  }
  
  // For ally/enemy targeting with a range
  if ((targeting === 'ally' || targeting === 'enemy') && range !== undefined) {
    // Get all hexes within the range - filtering for ally/enemy will be done in the component
    return getHexesInRange({ q: sourceQ, r: sourceR }, range);
  }
  
  // Default case (should not reach here if properly configured)
  return [];
}