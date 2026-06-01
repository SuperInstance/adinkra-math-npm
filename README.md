# adinkra-math

> West African Adinkra symbols as mathematics for JavaScript — symbolic encoding, topology, supersymmetry, and ML.

## What This Does

`adinkra-math` implements the mathematical framework inspired by Adinkra symbols for JavaScript/TypeScript. It provides symbolic encoding of concepts as geometric primitives, glyph composition, topological analysis (Euler characteristic, genus), supersymmetry Adinkra graphs, and ML operations (kNN, K-means). Use it for symbolic AI, educational tools, or cultural math.

## The Cultural Root

See the Python version (`adinkra-math` on PyPI) for the full cultural background. Adinkra symbols compress complex proverbs into geometric forms — the same principle as feature vectors in ML.

## Install

```bash
npm install adinkra-math
```

## Quick Start

```typescript
import {
  Symbol, SymbolType, getBuiltinSymbols,
  Glyph, GlyphOperation, compose, preserveInvariant,
  eulerCharacteristic, genus,
  encodeConcept, nearestConcept, knn, kmeans,
  createAdinkra, verifyChromotopology,
} from "adinkra-math";

// Built-in symbols
const symbols = getBuiltinSymbols();

// Compose glyphs
const composed = compose(
  new Glyph([symbols[0]]),
  new Glyph([symbols[1]]),
  GlyphOperation.SUPERIMPOSE
);
console.log(preserveInvariant(composed));

// Encode concepts
const c1 = encodeConcept("courage", 42);
const c2 = encodeConcept("wisdom", 42);

// KNN
const concepts = ["love", "war", "peace"].map(w => encodeConcept(w, 0));
const nearest = nearestConcept(encodeConcept("bravery", 0).vector, concepts);

// K-means
const clusters = kmeans(concepts, 2);

// Supersymmetry
const adinkra = createAdinkra(2);
console.log(adinkra.bosons.length, adinkra.fermions.length);
console.log(verifyChromotopology(adinkra));

// Topology
console.log(eulerCharacteristic(8, 12, 6));  // 2
console.log(genus(2));  // 0 (sphere)
```

## API Reference

### Symbols
- `SymbolType` enum: `CIRCLE`, `SPIRAL`, `CROSS`, `LINE`, `ARC`, `DIAMOND`, `TRIANGLE`, `STAR`, `HEART`
- `Symbol { name, primitives, meaning, weight, toVector() }`
- `getBuiltinSymbols() → Symbol[]`

### Glyphs
- `GlyphOperation` enum: `SUPERIMPOSE`, `CONCATENATE`, `NEST`
- `Glyph { symbols, primitives(), totalWeight() }`
- `compose(g1, g2, operation) → Glyph`
- `preserveInvariant(glyph) → boolean`

### Topology
- `eulerCharacteristic(v, e, f) → number`
- `genus(eulerChar) → number`
- `connectedComponents(graph) → number`

### Encoding & ML
- `Concept { label, vector }`
- `encodeConcept(text, seed?, dimensions?) → Concept`
- `distance(v1, v2) → number`
- `nearestConcept(vector, concepts) → Concept`
- `knn(query, concepts, k?) → Concept[]`
- `kmeans(concepts, k?, maxIter?) → Concept[][]`

### Supersymmetry
- `SUSYAdinkra { rank, bosons, fermions, edges }`
- `createAdinkra(rank) → SUSYAdinkra`
- `verifyChromotopology(adinkra) → boolean`
- `bosonFermionSplit(adinkra) → [number[], number[]]`

## License

MIT
