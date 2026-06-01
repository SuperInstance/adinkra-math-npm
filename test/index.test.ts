import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SymbolType,
  CompositionOp,
  NodeType,
  EdgeColor,
  createSymbol,
  getBuiltinSymbols,
  compose,
  preserveInvariant,
  encodeConcept,
  distance,
  nearestConcept,
  knn,
  createAdinkra,
  verifyChromotopology,
  bosonFermionSplit,
  connectedComponents,
  eulerCharacteristic,
  genus,
  makeTopoGraph,
  topoAddEdge,
  topoEulerCharacteristic,
  topoGenus,
  topoFromSUSY,
  topoFromSymbols,
  createConceptSpace,
  addConcept,
  conceptDistance,
  conceptSimilarity,
  conceptNearest,
  conceptKNearest,
  conceptCluster,
  glyphToSVG,
  susyToSVG,
  EDGE_COLOR_NAMES,
} from '../src/index.js';

// ─── Symbol Tests ────────────────────────────────────────────────────

describe('Symbol', () => {
  it('creates a symbol with correct properties', () => {
    const s = createSymbol(SymbolType.CIRCLE, 10, 20, 30);
    assert.equal(s.type, SymbolType.CIRCLE);
    assert.equal(s.x, 10);
    assert.equal(s.y, 20);
    assert.equal(s.scale, 30);
    assert.equal(s.rotation, 0);
    assert.equal(s.strokeWidth, 2);
    assert.equal(s.color, 0x000000);
  });

  it('creates a symbol with custom rotation, stroke, and color', () => {
    const s = createSymbol(SymbolType.CROSS, 0, 0, 15, Math.PI / 4, 3, 0xff0000);
    assert.equal(s.type, SymbolType.CROSS);
    assert.equal(s.rotation, Math.PI / 4);
    assert.equal(s.strokeWidth, 3);
    assert.equal(s.color, 0xff0000);
  });

  it('has all 8 symbol types', () => {
    const types = Object.values(SymbolType);
    assert.equal(types.length, 8);
    assert.ok(types.includes(SymbolType.CIRCLE));
    assert.ok(types.includes(SymbolType.SPIRAL));
    assert.ok(types.includes(SymbolType.CROSS));
    assert.ok(types.includes(SymbolType.KNOT));
    assert.ok(types.includes(SymbolType.LINE));
    assert.ok(types.includes(SymbolType.ARC));
    assert.ok(types.includes(SymbolType.TRIANGLE));
    assert.ok(types.includes(SymbolType.DIAMOND));
  });
});

// ─── Builtin Symbols ─────────────────────────────────────────────────

describe('Builtin Symbols', () => {
  it('returns 9 built-in glyphs', () => {
    const symbols = getBuiltinSymbols();
    assert.equal(symbols.length, 9);
  });

  it('includes Gye Nyame as the first symbol', () => {
    const symbols = getBuiltinSymbols();
    assert.equal(symbols[0].name, 'Gye Nyame');
    assert.equal(symbols[0].meaning, 'Supremacy of God');
    assert.equal(symbols[0].semanticWeight, 0.95);
  });

  it('includes Sankofa', () => {
    const symbols = getBuiltinSymbols();
    const sankofa = symbols.find((s) => s.name === 'Sankofa');
    assert.ok(sankofa);
    assert.ok(sankofa.meaning.includes('past'));
  });

  it('includes Fawohodie', () => {
    const symbols = getBuiltinSymbols();
    const f = symbols.find((s) => s.name === 'Fawohodie');
    assert.ok(f);
    assert.ok(f.meaning.includes('freedom'));
  });

  it('all semantic weights are in [0, 1]', () => {
    const symbols = getBuiltinSymbols();
    for (const s of symbols) {
      assert.ok(s.semanticWeight >= 0 && s.semanticWeight <= 1, `${s.name} weight ${s.semanticWeight}`);
    }
  });

  it('returns deep copies (modifying one does not affect next call)', () => {
    const a = getBuiltinSymbols();
    a[0].name = 'MODIFIED';
    const b = getBuiltinSymbols();
    assert.equal(b[0].name, 'Gye Nyame');
  });
});

// ─── Glyph Composition ───────────────────────────────────────────────

function makeTestGlyph(name: string, weight: number): ReturnType<typeof compose> extends infer G ? G : never {
  return {
    name,
    meaning: `test ${name}`,
    symbols: [createSymbol(SymbolType.CIRCLE, 0, 0, 20)],
    semanticWeight: weight,
    semanticInvariant: weight,
    originX: 0,
    originY: 0,
  };
}

describe('Glyph Composition', () => {
  it('STACK combines symbols from both glyphs', () => {
    const g1 = makeTestGlyph('a', 0.6);
    const g2 = makeTestGlyph('b', 0.8);
    g2.symbols.push(createSymbol(SymbolType.CROSS, 0, 0, 15));
    const result = compose(g1, g2, CompositionOp.STACK);
    assert.equal(result.symbols.length, 3);
    assert.ok(result.name.includes('a'));
    assert.ok(result.name.includes('b'));
  });

  it('STACK averages semantic invariants', () => {
    const g1 = makeTestGlyph('a', 0.6);
    const g2 = makeTestGlyph('b', 0.8);
    const result = compose(g1, g2, CompositionOp.STACK);
    assert.equal(result.semanticInvariant, 0.7);
  });

  it('NEST multiplies semantic invariants', () => {
    const g1 = makeTestGlyph('outer', 0.7);
    const g2 = makeTestGlyph('inner', 0.6);
    const result = compose(g1, g2, CompositionOp.NEST);
    assert.equal(result.semanticInvariant, 0.42);
  });

  it('NEST scales inner symbols', () => {
    const g1 = makeTestGlyph('outer', 0.7);
    const g2 = makeTestGlyph('inner', 0.6);
    g2.symbols = [createSymbol(SymbolType.CROSS, 10, 10, 20)];
    const result = compose(g1, g2, CompositionOp.NEST);
    assert.equal(result.symbols[1].scale, 12); // 20 * 0.6
  });

  it('MIRROR doubles the symbol count', () => {
    const g1 = makeTestGlyph('mir', 0.5);
    const result = compose(g1, g1, CompositionOp.MIRROR);
    assert.equal(result.symbols.length, 2);
  });

  it('INTERLEAVE alternates symbols', () => {
    const g1 = makeTestGlyph('a', 0.5);
    g1.symbols.push(createSymbol(SymbolType.LINE, 0, 0, 10));
    const g2 = makeTestGlyph('b', 0.7);
    g2.symbols.push(createSymbol(SymbolType.TRIANGLE, 0, 0, 10));
    const result = compose(g1, g2, CompositionOp.INTERLEAVE);
    assert.equal(result.symbols.length, 4);
  });

  it('OVERLAY combines all symbols', () => {
    const g1 = makeTestGlyph('a', 0.3);
    g1.symbols.push(createSymbol(SymbolType.LINE, 0, 0, 10));
    const g2 = makeTestGlyph('b', 0.9);
    const result = compose(g1, g2, CompositionOp.OVERLAY);
    assert.equal(result.symbols.length, 3);
    assert.equal(result.semanticInvariant, 0.9); // max
  });

  it('preserveInvariant returns true for valid invariants', () => {
    const g = makeTestGlyph('test', 0.5);
    assert.ok(preserveInvariant(g));
  });

  it('preserveInvariant returns false for out-of-range invariants', () => {
    const g = makeTestGlyph('test', 0.5);
    g.semanticInvariant = 1.5;
    assert.ok(!preserveInvariant(g));
  });
});

// ─── Encoding ────────────────────────────────────────────────────────

describe('Encoding', () => {
  it('encodeConcept returns a vector of the correct length', () => {
    const v = encodeConcept('wisdom', 6);
    assert.equal(v.length, 6);
  });

  it('encodeConcept produces deterministic results', () => {
    const v1 = encodeConcept('test', 4);
    const v2 = encodeConcept('test', 4);
    assert.deepEqual(v1, v2);
  });

  it('encodeConcept produces different vectors for different concepts', () => {
    const v1 = encodeConcept('wisdom', 4);
    const v2 = encodeConcept('strength', 4);
    assert.ok(distance(v1, v2) > 0);
  });

  it('distance between identical vectors is 0', () => {
    const v = [1, 2, 3];
    assert.equal(distance(v, v), 0);
  });

  it('distance computes Euclidean distance correctly', () => {
    const d = distance([0, 0], [3, 4]);
    assert.equal(d, 5);
  });

  it('nearestConcept finds the closest concept', () => {
    const concepts = [
      { name: 'x', vector: [1, 0, 0] },
      { name: 'y', vector: [0, 1, 0] },
      { name: 'z', vector: [0, 0, 1] },
    ];
    const result = nearestConcept([0.9, 0.1, 0.1], concepts);
    assert.equal(result.name, 'x');
  });

  it('knn returns k nearest concepts sorted by distance', () => {
    const concepts = [
      { name: 'p0', vector: [0, 0] },
      { name: 'p1', vector: [1, 1] },
      { name: 'p2', vector: [2, 2] },
      { name: 'far', vector: [10, 10] },
    ];
    const results = knn([0.5, 0.5], concepts, 3);
    assert.equal(results.length, 3);
    // p2 should be third nearest, 'far' should be excluded
    const names = results.map((r) => r.name);
    assert.ok(!names.includes('far'));
  });

  it('encodeConcept normalizes to unit length', () => {
    const v = encodeConcept('test', 4);
    const mag = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    assert.ok(Math.abs(mag - 1) < 0.01, `magnitude was ${mag}`);
  });
});

// ─── Concept Space ───────────────────────────────────────────────────

describe('Concept Space', () => {
  it('creates an empty concept space', () => {
    const cs = createConceptSpace(4);
    assert.equal(cs.concepts.length, 0);
    assert.equal(cs.dimensions, 4);
  });

  it('adds concepts and returns index', () => {
    const cs = createConceptSpace(3);
    const idx = addConcept(cs, 'test', [1, 0, 0], 0.9);
    assert.equal(idx, 0);
    assert.equal(cs.concepts[0].name, 'test');
    assert.equal(cs.concepts[0].weight, 0.9);
  });

  it('conceptDistance computes correctly', () => {
    const a = { name: 'a', vector: [0, 0], dimensions: 2, weight: 1 };
    const b = { name: 'b', vector: [3, 4], dimensions: 2, weight: 1 };
    assert.equal(conceptDistance(a, b), 5);
  });

  it('conceptSimilarity is 1 for identical concepts', () => {
    const a = { name: 'a', vector: [0.5, 0.5, 0.5], dimensions: 3, weight: 1 };
    assert.equal(conceptSimilarity(a, a), 1);
  });

  it('conceptNearest finds closest', () => {
    const cs = createConceptSpace(2);
    addConcept(cs, 'origin', [0, 0]);
    addConcept(cs, 'far', [10, 10]);
    const nearest = conceptNearest(cs, [0.1, 0.1]);
    assert.equal(nearest.name, 'origin');
  });

  it('conceptKNearest returns k results', () => {
    const cs = createConceptSpace(2);
    addConcept(cs, 'a', [0, 0]);
    addConcept(cs, 'b', [1, 1]);
    addConcept(cs, 'c', [5, 5]);
    const results = conceptKNearest(cs, [0.5, 0.5], 2);
    assert.equal(results.length, 2);
  });

  it('conceptCluster groups nearby concepts', () => {
    const cs = createConceptSpace(2);
    // Cluster 1: near origin
    for (let i = 0; i < 5; i++) {
      addConcept(cs, `c1_${i}`, [0.1 + i * 0.02, 0.1 + i * 0.02]);
    }
    // Cluster 2: near (1,1)
    for (let i = 0; i < 5; i++) {
      addConcept(cs, `c2_${i}`, [0.9 - i * 0.02, 0.9 - i * 0.02]);
    }
    const result = conceptCluster(cs, 2, 20);
    assert.equal(result.k, 2);
    assert.ok(result.iterations > 0);
    // First 5 should be in same cluster
    const c = result.assignments[0];
    for (let i = 1; i < 5; i++) {
      assert.equal(result.assignments[i], c, `concept ${i} should match cluster 0`);
    }
    // Last 5 should be in different cluster
    assert.notEqual(result.assignments[5], c);
  });
});

// ─── Supersymmetry ───────────────────────────────────────────────────

describe('Supersymmetry', () => {
  it('creates a rank-4 adinkra with correct structure', () => {
    const a = createAdinkra(4);
    assert.equal(a.rank, 4);
    assert.equal(a.nodes.length, 8); // 4 bosons + 4 fermions
    assert.equal(a.edges.length, 16); // 4 colors × 4 connections
  });

  it('creates a rank-8 adinkra with correct structure', () => {
    const a = createAdinkra(8);
    assert.equal(a.rank, 8);
    assert.equal(a.nodes.length, 16);
    assert.equal(a.edges.length, 64);
  });

  it('verifies chromotopology for rank-4 adinkra', () => {
    const a = createAdinkra(4);
    assert.ok(verifyChromotopology(a));
  });

  it('verifies chromotopology for rank-8 adinkra', () => {
    const a = createAdinkra(8);
    assert.ok(verifyChromotopology(a));
  });

  it('chromotopology fails for invalid adinkra (boson-boson edge)', () => {
    const a = createAdinkra(2);
    // Add invalid boson-boson edge
    a.edges.push({ from: 0, to: 1, color: EdgeColor.BLUE, sign: 1 });
    assert.ok(!verifyChromotopology(a));
  });

  it('bosonFermionSplit separates node types', () => {
    const a = createAdinkra(4);
    const { bosons, fermions } = bosonFermionSplit(a);
    assert.equal(bosons.length, 4);
    assert.equal(fermions.length, 4);
    assert.ok(bosons.every((n) => n.type === NodeType.BOSON));
    assert.ok(fermions.every((n) => n.type === NodeType.FERMION));
  });

  it('edge colors have correct names', () => {
    assert.equal(EDGE_COLOR_NAMES[EdgeColor.RED], 'red');
    assert.equal(EDGE_COLOR_NAMES[EdgeColor.BLUE], 'blue');
    assert.equal(EDGE_COLOR_NAMES[EdgeColor.GREEN], 'green');
  });

  it('edges alternate signs', () => {
    const a = createAdinkra(4);
    const signs = a.edges.map((e) => e.sign);
    assert.ok(signs.includes(1));
    assert.ok(signs.includes(-1));
  });

  it('each color uses rank edges', () => {
    const a = createAdinkra(4);
    const colors = [...new Set(a.edges.map((e) => e.color))];
    assert.equal(colors.length, 4);
    for (const c of colors) {
      assert.equal(a.edges.filter((e) => e.color === c).length, 4);
    }
  });
});

// ─── Topology ────────────────────────────────────────────────────────

describe('Topology', () => {
  it('connectedComponents returns 1 for connected graph', () => {
    const g = makeTopoGraph(4);
    topoAddEdge(g, 0, 1);
    topoAddEdge(g, 1, 2);
    topoAddEdge(g, 2, 3);
    assert.equal(connectedComponents(g), 1);
  });

  it('connectedComponents returns correct count for disconnected graph', () => {
    const g = makeTopoGraph(6);
    topoAddEdge(g, 0, 1);
    topoAddEdge(g, 1, 2);
    // 3, 4, 5 isolated
    assert.equal(connectedComponents(g), 4);
  });

  it('connectedComponents returns 0 for empty graph', () => {
    const g = makeTopoGraph(0);
    assert.equal(connectedComponents(g), 0);
  });

  it('eulerCharacteristic computes V - E + F', () => {
    assert.equal(eulerCharacteristic(4, 6, 4), 2);
  });

  it('genus computes (2 - chi) / 2', () => {
    assert.equal(genus(2), 0);  // sphere
    assert.equal(genus(0), 1);  // torus
    assert.equal(genus(-2), 2); // double torus
  });

  it('genus clamps to 0', () => {
    assert.equal(genus(4), 0); // would be -1, clamped to 0
  });

  it('topoEulerCharacteristic for triangle is 2', () => {
    const g = makeTopoGraph(3);
    topoAddEdge(g, 0, 1);
    topoAddEdge(g, 1, 2);
    topoAddEdge(g, 2, 0);
    assert.equal(topoEulerCharacteristic(g), 2);
  });

  it('topoGenus for tree is 0', () => {
    const g = makeTopoGraph(3);
    topoAddEdge(g, 0, 1);
    topoAddEdge(g, 1, 2);
    assert.equal(topoGenus(g), 0);
  });

  it('topoFromSUSY creates graph from adinkra', () => {
    const a = createAdinkra(4);
    const g = topoFromSUSY(a);
    assert.equal(g.vertexCount, 8);
    assert.equal(g.edges.length, 16);
    assert.equal(connectedComponents(g), 1);
  });

  it('topoFromSymbols detects overlapping symbols', () => {
    const symbols = [
      createSymbol(SymbolType.CIRCLE, 0, 0, 30),
      createSymbol(SymbolType.CIRCLE, 20, 0, 20),
    ];
    const g = topoFromSymbols(symbols);
    assert.equal(g.vertexCount, 2);
    assert.equal(g.edges.length, 1);
  });

  it('topoFromSymbols no edges for distant symbols', () => {
    const symbols = [
      createSymbol(SymbolType.CIRCLE, 0, 0, 10),
      createSymbol(SymbolType.CIRCLE, 100, 0, 10),
    ];
    const g = topoFromSymbols(symbols);
    assert.equal(g.edges.length, 0);
  });

  it('topoAddEdge does not create duplicate edges', () => {
    const g = makeTopoGraph(4);
    topoAddEdge(g, 0, 1);
    topoAddEdge(g, 1, 0);
    assert.equal(g.edges.length, 1);
  });
});

// ─── SVG Rendering ───────────────────────────────────────────────────

describe('SVG Rendering', () => {
  it('glyphToSVG produces valid SVG', () => {
    const g = makeTestGlyph('TestSVG', 0.5);
    const svg = glyphToSVG(g, 200, 200);
    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('TestSVG'));
    assert.ok(svg.includes('circle'));
  });

  it('susyToSVG produces valid SVG', () => {
    const a = createAdinkra(4);
    const svg = susyToSVG(a, 400, 400);
    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('B0'));
    assert.ok(svg.includes('F0'));
  });
});
