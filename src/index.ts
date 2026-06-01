/**
 * adinkra-math — West African symbolic encoding + SUSY adinkras
 * TypeScript/npm port of the C adinkra-math library.
 *
 * Bridges two meanings of "adinkra":
 *  - West African (Akan) visual symbols encoding philosophical concepts
 *  - Physics adinkras — graphical tools for studying SUSY algebra representations
 */

// ─── Types ───────────────────────────────────────────────────────────

export enum SymbolType {
  CIRCLE = 'CIRCLE',
  SPIRAL = 'SPIRAL',
  CROSS = 'CROSS',
  KNOT = 'KNOT',
  LINE = 'LINE',
  ARC = 'ARC',
  TRIANGLE = 'TRIANGLE',
  DIAMOND = 'DIAMOND',
}

export interface Symbol {
  type: SymbolType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  strokeWidth: number;
  color: number; // 0xRRGGBB
}

export interface Glyph {
  symbols: Symbol[];
  name: string;
  meaning: string;
  semanticWeight: number;
  semanticInvariant: number;
  originX: number;
  originY: number;
}

export enum CompositionOp {
  STACK = 'STACK',
  NEST = 'NEST',
  INTERLEAVE = 'INTERLEAVE',
  MIRROR = 'MIRROR',
  OVERLAY = 'OVERLAY',
}

export enum NodeType {
  BOSON = 'BOSON',
  FERMION = 'FERMION',
}

export interface SUSYNode {
  id: number;
  type: NodeType;
  x: number;
  y: number;
  label: string;
}

export enum EdgeColor {
  RED = 'RED',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
  ORANGE = 'ORANGE',
  PURPLE = 'PURPLE',
  CYAN = 'CYAN',
  PINK = 'PINK',
}

export interface SUSYEdge {
  from: number;
  to: number;
  color: EdgeColor;
  sign: number; // +1 or -1
}

export interface SUSYAdinkra {
  nodes: SUSYNode[];
  edges: SUSYEdge[];
  rank: number;
}

export interface EncodedConcept {
  name: string;
  vector: number[];
  dimensions: number;
  weight: number;
}

export interface ConceptSpace {
  concepts: EncodedConcept[];
  dimensions: number;
}

export interface TopoGraph {
  vertexCount: number;
  edges: Array<{ from: number; to: number }>;
  adj: number[][];
}

export const ALL_EDGE_COLORS: EdgeColor[] = [
  EdgeColor.RED, EdgeColor.GREEN, EdgeColor.BLUE, EdgeColor.YELLOW,
  EdgeColor.ORANGE, EdgeColor.PURPLE, EdgeColor.CYAN, EdgeColor.PINK,
];

export const EDGE_COLOR_NAMES: Record<EdgeColor, string> = {
  [EdgeColor.RED]: 'red',
  [EdgeColor.GREEN]: 'green',
  [EdgeColor.BLUE]: 'blue',
  [EdgeColor.YELLOW]: 'yellow',
  [EdgeColor.ORANGE]: 'orange',
  [EdgeColor.PURPLE]: 'purple',
  [EdgeColor.CYAN]: 'cyan',
  [EdgeColor.PINK]: 'pink',
};

// ─── Symbol ──────────────────────────────────────────────────────────

export function createSymbol(
  type: SymbolType,
  x: number,
  y: number,
  scale: number,
  rotation = 0,
  strokeWidth = 2,
  color = 0x000000,
): Symbol {
  return { type, x, y, scale, rotation, strokeWidth, color };
}

const BUILTIN_SYMBOLS: Glyph[] = [
  {
    name: 'Gye Nyame',
    meaning: 'Supremacy of God',
    semanticWeight: 0.95,
    semanticInvariant: 0.95,
    originX: 0,
    originY: 0,
    symbols: [
      createSymbol(SymbolType.CIRCLE, 0, 0, 40),
      createSymbol(SymbolType.SPIRAL, 10, 0, 25),
    ],
  },
  {
    name: 'Adwene Pa',
    meaning: 'Good thinking, good heart',
    semanticWeight: 0.80,
    semanticInvariant: 0.80,
    originX: 0,
    originY: 0,
    symbols: [
      createSymbol(SymbolType.DIAMOND, 0, 0, 30),
      createSymbol(SymbolType.TRIANGLE, 0, 15, 15),
    ],
  },
  {
    name: 'Sankofa',
    meaning: 'Return and fetch it — learn from past',
    semanticWeight: 0.90,
    semanticInvariant: 0.90,
    originX: 0,
    originY: 0,
    symbols: [
      createSymbol(SymbolType.SPIRAL, 0, 0, 35),
      createSymbol(SymbolType.TRIANGLE, -15, 15, 15),
    ],
  },
  {
    name: 'Nkyinkyim',
    meaning: 'Initiative, dynamism, versatility',
    semanticWeight: 0.75,
    semanticInvariant: 0.75,
    originX: 0,
    originY: 0,
    symbols: [
      createSymbol(SymbolType.SPIRAL, -15, 0, 20),
      createSymbol(SymbolType.SPIRAL, 15, 0, 20),
      createSymbol(SymbolType.LINE, 0, 0, 30, 0.5),
    ],
  },
  {
    name: 'Dwennimmen',
    meaning: 'Humility with strength',
    semanticWeight: 0.85,
    semanticInvariant: 0.85,
    originX: 0,
    originY: 0,
    symbols: [
      createSymbol(SymbolType.CIRCLE, 0, 0, 30),
      createSymbol(SymbolType.CROSS, 0, 0, 20),
    ],
  },
  {
    name: 'Nkonsondepie',
    meaning: 'Chain links — unity and bonds',
    semanticWeight: 0.70,
    semanticInvariant: 0.70,
    originX: 0,
    originY: 0,
    symbols: [
      createSymbol(SymbolType.CIRCLE, -30, 0, 12),
      createSymbol(SymbolType.CIRCLE, -10, 0, 12),
      createSymbol(SymbolType.CIRCLE, 10, 0, 12),
      createSymbol(SymbolType.CIRCLE, 30, 0, 12),
    ],
  },
  {
    name: 'Akoma',
    meaning: 'Patience and tolerance (heart)',
    semanticWeight: 0.80,
    semanticInvariant: 0.80,
    originX: 0,
    originY: 0,
    symbols: [
      createSymbol(SymbolType.TRIANGLE, 0, 5, 30, Math.PI),
      createSymbol(SymbolType.CIRCLE, -12, -5, 15),
    ],
  },
  {
    name: 'Mate Masie',
    meaning: 'What I hear, I keep — wisdom',
    semanticWeight: 0.85,
    semanticInvariant: 0.85,
    originX: 0,
    originY: 0,
    symbols: [
      createSymbol(SymbolType.CROSS, 0, 0, 25),
      createSymbol(SymbolType.KNOT, 0, 0, 20),
    ],
  },
  {
    name: 'Fawohodie',
    meaning: 'Independence, freedom, emancipation',
    semanticWeight: 0.90,
    semanticInvariant: 0.90,
    originX: 0,
    originY: 0,
    symbols: [
      createSymbol(SymbolType.CROSS, 0, 0, 35),
      createSymbol(SymbolType.CIRCLE, 0, 0, 20),
    ],
  },
];

export function getBuiltinSymbols(): Glyph[] {
  // Return deep copies
  return BUILTIN_SYMBOLS.map((g) => ({
    ...g,
    symbols: g.symbols.map((s) => ({ ...s })),
  }));
}

// ─── Glyph Composition ───────────────────────────────────────────────

export function compose(g1: Glyph, g2: Glyph, operation: CompositionOp): Glyph {
  let symbols: Symbol[];
  let semanticInvariant: number;
  let name: string;
  let meaning: string;

  switch (operation) {
    case CompositionOp.STACK: {
      symbols = [
        ...g1.symbols.map((s) => ({ ...s, y: s.y - 20 })),
        ...g2.symbols.map((s) => ({ ...s, y: s.y + 20 })),
      ];
      semanticInvariant = (g1.semanticInvariant + g2.semanticInvariant) / 2;
      name = `${g1.name}+${g2.name}`;
      meaning = `${g1.meaning} stacked with ${g2.meaning}`;
      break;
    }
    case CompositionOp.NEST: {
      symbols = [
        ...g1.symbols,
        ...g2.symbols.map((s) => ({ ...s, scale: s.scale * 0.6 })),
      ];
      semanticInvariant = g1.semanticInvariant * g2.semanticInvariant;
      name = `${g1.name}⟨${g2.name}⟩`;
      meaning = `${g2.meaning} nested within ${g1.meaning}`;
      break;
    }
    case CompositionOp.INTERLEAVE: {
      const result: Symbol[] = [];
      const max = Math.max(g1.symbols.length, g2.symbols.length);
      for (let i = 0; i < max; i++) {
        if (i < g1.symbols.length) result.push({ ...g1.symbols[i] });
        if (i < g2.symbols.length) result.push({ ...g2.symbols[i] });
      }
      symbols = result;
      semanticInvariant = (g1.semanticInvariant + g2.semanticInvariant) / 2;
      name = `${g1.name}~${g2.name}`;
      meaning = `${g1.meaning} interleaved with ${g2.meaning}`;
      break;
    }
    case CompositionOp.MIRROR: {
      symbols = [
        ...g1.symbols,
        ...g1.symbols.map((s) => ({ ...s, x: -s.x })),
      ];
      semanticInvariant = g1.semanticInvariant;
      name = `${g1.name}‖`;
      meaning = `Mirrored ${g1.meaning}`;
      break;
    }
    case CompositionOp.OVERLAY: {
      symbols = [
        ...g1.symbols,
        ...g2.symbols,
      ];
      semanticInvariant = Math.max(g1.semanticInvariant, g2.semanticInvariant);
      name = `${g1.name}⊙${g2.name}`;
      meaning = `${g1.meaning} overlaid with ${g2.meaning}`;
      break;
    }
  }

  return {
    symbols,
    name,
    meaning,
    semanticWeight: semanticInvariant,
    semanticInvariant,
    originX: 0,
    originY: 0,
  };
}

export function preserveInvariant(glyph: Glyph): boolean {
  return glyph.semanticInvariant >= 0 && glyph.semanticInvariant <= 1;
}

// ─── Encoding ────────────────────────────────────────────────────────

export function encodeConcept(concept: string, dimensions: number): number[] {
  // Deterministic hash-based encoding from concept name
  const vector: number[] = new Array(dimensions).fill(0);
  let hash = 0;
  for (let i = 0; i < concept.length; i++) {
    hash = ((hash << 5) - hash + concept.charCodeAt(i)) | 0;
  }
  // Use hash to seed a simple PRNG for deterministic vector generation
  let seed = Math.abs(hash) + 1;
  for (let d = 0; d < dimensions; d++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    vector[d] = (seed % 1000) / 1000;
  }
  // Normalize to unit length
  const mag = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
  if (mag > 0) {
    for (let d = 0; d < dimensions; d++) vector[d] /= mag;
  }
  return vector;
}

export function distance(v1: number[], v2: number[]): number {
  const dim = Math.min(v1.length, v2.length);
  let sum = 0;
  for (let i = 0; i < dim; i++) {
    const diff = v1[i] - v2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function nearestConcept(
  vector: number[],
  concepts: Array<{ name: string; vector: number[] }>,
): { name: string; vector: number[] } {
  let best = concepts[0];
  let bestDist = distance(vector, concepts[0].vector);
  for (let i = 1; i < concepts.length; i++) {
    const d = distance(vector, concepts[i].vector);
    if (d < bestDist) {
      bestDist = d;
      best = concepts[i];
    }
  }
  return best;
}

export function knn(
  query: number[],
  concepts: Array<{ name: string; vector: number[] }>,
  k: number,
): Array<{ name: string; vector: number[] }> {
  const scored = concepts.map((c) => ({ concept: c, dist: distance(query, c.vector) }));
  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, k).map((s) => s.concept);
}

// ─── Supersymmetry ───────────────────────────────────────────────────

export function createAdinkra(rank: number): SUSYAdinkra {
  const adinkra: SUSYAdinkra = { nodes: [], edges: [], rank };
  const half = rank; // rank bosons, rank fermions

  // Add boson nodes
  for (let i = 0; i < half; i++) {
    adinkra.nodes.push({
      id: i,
      type: NodeType.BOSON,
      x: 80 * (i - (half - 1) / 2),
      y: -60,
      label: `B${i}`,
    });
  }

  // Add fermion nodes
  for (let i = 0; i < half; i++) {
    adinkra.nodes.push({
      id: half + i,
      type: NodeType.FERMION,
      x: 80 * (i - (half - 1) / 2),
      y: 60,
      label: `F${i}`,
    });
  }

  // Add edges: rank colors, each connecting every boson to exactly one fermion
  // This creates a proper chromotopology: each color forms a perfect matching
  const colors = ALL_EDGE_COLORS.slice(0, rank);
  for (let c = 0; c < rank; c++) {
    for (let b = 0; b < half; b++) {
      // Color c connects boson b to fermion (b + c) % half
      // with alternating signs
      const f = (b + c) % half;
      const sign = (b + c) % 2 === 0 ? 1 : -1;
      adinkra.edges.push({
        from: b,
        to: half + f,
        color: colors[c],
        sign,
      });
    }
  }

  return adinkra;
}

export function verifyChromotopology(adinkra: SUSYAdinkra): boolean {
  // Each color must form a perfect matching (bijection between bosons and fermions)
  const bosons = adinkra.nodes.filter((n) => n.type === NodeType.BOSON);
  const fermions = adinkra.nodes.filter((n) => n.type === NodeType.FERMION);
  const colors = [...new Set(adinkra.edges.map((e) => e.color))];

  for (const color of colors) {
    const colorEdges = adinkra.edges.filter((e) => e.color === color);
    // Each color should have exactly one edge per boson
    const bosonDegrees = new Map<number, number>();
    const fermionDegrees = new Map<number, number>();
    for (const e of colorEdges) {
      bosonDegrees.set(e.from, (bosonDegrees.get(e.from) || 0) + 1);
      fermionDegrees.set(e.to, (fermionDegrees.get(e.to) || 0) + 1);
    }
    // Every boson must have degree 1 in this color
    for (const b of bosons) {
      if (bosonDegrees.get(b.id) !== 1) return false;
    }
    // Every fermion must have degree 1 in this color
    for (const f of fermions) {
      if (fermionDegrees.get(f.id) !== 1) return false;
    }
  }
  return true;
}

export function bosonFermionSplit(
  adinkra: SUSYAdinkra,
): { bosons: SUSYNode[]; fermions: SUSYNode[] } {
  return {
    bosons: adinkra.nodes.filter((n) => n.type === NodeType.BOSON),
    fermions: adinkra.nodes.filter((n) => n.type === NodeType.FERMION),
  };
}

// ─── Topology ────────────────────────────────────────────────────────

export function connectedComponents(graph: TopoGraph): number {
  if (graph.vertexCount === 0) return 0;

  const visited = new Array(graph.vertexCount).fill(false);

  function dfs(v: number): void {
    visited[v] = true;
    for (let u = 0; u < graph.vertexCount; u++) {
      if (graph.adj[v]?.[u] && !visited[u]) {
        dfs(u);
      }
    }
  }

  let count = 0;
  for (let v = 0; v < graph.vertexCount; v++) {
    if (!visited[v]) {
      dfs(v);
      count++;
    }
  }
  return count;
}

export function eulerCharacteristic(nodes: number, edges: number, faces: number): number {
  return nodes - edges + faces;
}

export function genus(euler: number): number {
  // g = (2 - chi) / 2 for orientable surfaces; clamp to >= 0
  return Math.max(0, (2 - euler) / 2);
}

export function makeTopoGraph(vertexCount: number): TopoGraph {
  const adj: number[][] = Array.from({ length: vertexCount }, () =>
    new Array(vertexCount).fill(0),
  );
  return { vertexCount, edges: [], adj };
}

export function topoAddEdge(graph: TopoGraph, from: number, to: number): void {
  if (graph.adj[from][to] === 0) {
    graph.adj[from][to] = 1;
    graph.adj[to][from] = 1;
    graph.edges.push({ from, to });
  }
}

export function topoEulerCharacteristic(graph: TopoGraph): number {
  // For planar embedding: F = E - V + C + 1
  const C = connectedComponents(graph);
  const V = graph.vertexCount;
  const E = graph.edges.length;
  const F = E - V + C + 1;
  return V - E + F;
}

export function topoGenus(graph: TopoGraph): number {
  return genus(topoEulerCharacteristic(graph));
}

export function topoFromSUSY(adinkra: SUSYAdinkra): TopoGraph {
  const g = makeTopoGraph(adinkra.nodes.length);
  for (const e of adinkra.edges) {
    topoAddEdge(g, e.from, e.to);
  }
  return g;
}

export function topoFromSymbols(symbols: Symbol[]): TopoGraph {
  // Each symbol is a vertex; overlapping symbols form edges
  const g = makeTopoGraph(symbols.length);
  for (let i = 0; i < symbols.length; i++) {
    for (let j = i + 1; j < symbols.length; j++) {
      const dx = symbols[i].x - symbols[j].x;
      const dy = symbols[i].y - symbols[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const overlap = (symbols[i].scale + symbols[j].scale) * 0.8;
      if (dist < overlap) {
        topoAddEdge(g, i, j);
      }
    }
  }
  return g;
}

// ─── Concept Space Helpers ───────────────────────────────────────────

export function createConceptSpace(dimensions: number): ConceptSpace {
  return { concepts: [], dimensions };
}

export function addConcept(
  space: ConceptSpace,
  name: string,
  vector: number[],
  weight = 1.0,
): number {
  space.concepts.push({ name, vector, dimensions: vector.length, weight });
  return space.concepts.length - 1;
}

export function conceptDistance(a: EncodedConcept, b: EncodedConcept): number {
  return distance(a.vector, b.vector);
}

export function conceptSimilarity(a: EncodedConcept, b: EncodedConcept): number {
  const d = distance(a.vector, b.vector);
  return 1 - Math.min(d, 1); // clamp for normalized vectors
}

export function conceptNearest(
  space: ConceptSpace,
  query: number[],
): EncodedConcept {
  let best = space.concepts[0];
  let bestDist = distance(query, best.vector);
  for (let i = 1; i < space.concepts.length; i++) {
    const d = distance(query, space.concepts[i].vector);
    if (d < bestDist) {
      bestDist = d;
      best = space.concepts[i];
    }
  }
  return best;
}

export function conceptKNearest(
  space: ConceptSpace,
  query: number[],
  k: number,
): EncodedConcept[] {
  const scored = space.concepts.map((c) => ({ concept: c, dist: distance(query, c.vector) }));
  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, k).map((s) => s.concept);
}

export function conceptCluster(
  space: ConceptSpace,
  k: number,
  maxIter = 20,
): { centroids: number[][]; assignments: number[]; k: number; iterations: number } {
  const dim = space.dimensions;
  const n = space.concepts.length;

  // Initialize centroids to first k concepts
  let centroids = space.concepts.slice(0, k).map((c) => [...c.vector]);
  const assignments = new Array(n).fill(0);

  let iterations = 0;
  for (let iter = 0; iter < maxIter; iter++) {
    iterations++;
    let changed = false;

    // Assign each concept to nearest centroid
    for (let i = 0; i < n; i++) {
      let bestC = 0;
      let bestD = distance(space.concepts[i].vector, centroids[0]);
      for (let c = 1; c < k; c++) {
        const d = distance(space.concepts[i].vector, centroids[c]);
        if (d < bestD) {
          bestD = d;
          bestC = c;
        }
      }
      if (assignments[i] !== bestC) {
        assignments[i] = bestC;
        changed = true;
      }
    }

    if (!changed) break;

    // Update centroids
    for (let c = 0; c < k; c++) {
      const members = space.concepts.filter((_, i) => assignments[i] === c);
      if (members.length === 0) continue;
      const newCentroid = new Array(dim).fill(0);
      for (const m of members) {
        for (let d = 0; d < dim; d++) newCentroid[d] += m.vector[d];
      }
      for (let d = 0; d < dim; d++) newCentroid[d] /= members.length;
      centroids[c] = newCentroid;
    }
  }

  return { centroids, assignments, k, iterations };
}

// ─── SVG Rendering ───────────────────────────────────────────────────

function symbolToSVGFragment(s: Symbol, ox: number, oy: number): string {
  const x = s.x + ox;
  const y = s.y + oy;
  const r = s.scale;
  const sw = s.strokeWidth;
  const color = `#${(s.color || 0).toString(16).padStart(6, '0')}`;
  switch (s.type) {
    case SymbolType.CIRCLE:
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
    case SymbolType.LINE: {
      const dx = r * Math.cos(s.rotation);
      const dy = r * Math.sin(s.rotation);
      return `<line x1="${x - dx}" y1="${y - dy}" x2="${x + dx}" y2="${y + dy}" stroke="${color}" stroke-width="${sw}"/>`;
    }
    case SymbolType.CROSS: {
      const dx = r * Math.cos(s.rotation);
      const dy = r * Math.sin(s.rotation);
      return `<line x1="${x - dx}" y1="${y - dy}" x2="${x + dx}" y2="${y + dy}" stroke="${color}" stroke-width="${sw}"/>`
        + `\n<line x1="${x - dy}" y1="${y + dx}" x2="${x + dy}" y2="${y - dx}" stroke="${color}" stroke-width="${sw}"/>`;
    }
    case SymbolType.TRIANGLE: {
      const pts = [0, 1, 2].map((i) => {
        const a = s.rotation + (i * 2 * Math.PI) / 3;
        return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
      });
      return `<polygon points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
    }
    case SymbolType.DIAMOND: {
      const pts = [
        `${x},${y - r}`,
        `${x + r},${y}`,
        `${x},${y + r}`,
        `${x - r},${y}`,
      ];
      return `<polygon points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
    }
    case SymbolType.ARC: {
      const rx = r;
      const ry = r;
      return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
    }
    case SymbolType.SPIRAL: {
      // Approximate spiral with a circle + small arc
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>`
        + `\n<circle cx="${x + r * 0.3}" cy="${y}" r="${r * 0.5}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
    }
    case SymbolType.KNOT: {
      // Two overlapping circles
      return `<circle cx="${x - r * 0.2}" cy="${y}" r="${r * 0.6}" fill="none" stroke="${color}" stroke-width="${sw}"/>`
        + `\n<circle cx="${x + r * 0.2}" cy="${y}" r="${r * 0.6}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
    }
    default:
      return '';
  }
}

export function glyphToSVG(glyph: Glyph, width: number, height: number): string {
  const cx = width / 2;
  const cy = height / 2;
  const fragments = glyph.symbols.map((s) => symbolToSVGFragment(s, cx, cy));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    + `\n<text x="${cx}" y="20" text-anchor="middle" font-size="14">${glyph.name}</text>`
    + `\n${fragments.join('\n')}`
    + `\n</svg>`;
}

export function susyToSVG(adinkra: SUSYAdinkra, width: number, height: number): string {
  const colorMap: Record<string, string> = {
    RED: '#ff0000', GREEN: '#00ff00', BLUE: '#0000ff', YELLOW: '#ffff00',
    ORANGE: '#ff6600', PURPLE: '#9900ff', CYAN: '#00ffff', PINK: '#ff69b4',
  };
  const cx = width / 2;
  const cy = height / 2;
  const nodeFrags = adinkra.nodes.map((n) =>
    `<circle cx="${cx + n.x}" cy="${cy + n.y}" r="12" fill="${n.type === NodeType.BOSON ? '#4488ff' : '#ff4444'}"/>`
    + `\n<text x="${cx + n.x}" y="${cy + n.y + 4}" text-anchor="middle" font-size="10" fill="white">${n.label}</text>`,
  );
  const edgeFrags = adinkra.edges.map((e) => {
    const from = adinkra.nodes[e.from];
    const to = adinkra.nodes[e.to];
    const color = colorMap[e.color] || '#888';
    const dash = e.sign < 0 ? ' stroke-dasharray="4"' : '';
    return `<line x1="${cx + from.x}" y1="${cy + from.y}" x2="${cx + to.x}" y2="${cy + to.y}" stroke="${color}" stroke-width="2"${dash}/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    + `\n${edgeFrags.join('\n')}`
    + `\n${nodeFrags.join('\n')}`
    + `\n</svg>`;
}
