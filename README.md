# adinkra-math

West African symbolic encoding + SUSY adinkras for the browser — TypeScript/npm port.

Bridges two meanings of "adinkra":
- **West African (Akan) visual symbols** encoding philosophical concepts
- **Physics adinkras** — graphical tools for studying representations of supersymmetry algebras

## Install

```bash
npm install adinkra-math
```

## API

### Symbol

```ts
import { createSymbol, getBuiltinSymbols, SymbolType } from 'adinkra-math';

const circle = createSymbol(SymbolType.CIRCLE, 0, 0, 40);
const builtins = getBuiltinSymbols(); // 9 built-in: Gye Nyame, Sankofa, Fawohodie, ...
```

### Glyph Composition

```ts
import { compose, CompositionOp } from 'adinkra-math';

const stacked = compose(glyph1, glyph2, CompositionOp.STACK);
const nested = compose(glyph1, glyph2, CompositionOp.NEST);
```

### Encoding

```ts
import { encodeConcept, distance, nearestConcept, knn } from 'adinkra-math';

const wisdom = encodeConcept('wisdom', 6);
const strength = encodeConcept('strength', 6);
const d = distance(wisdom, strength);
```

### Supersymmetry

```ts
import { createAdinkra, verifyChromotopology, bosonFermionSplit } from 'adinkra-math';

const adinkra = createAdinkra(4); // rank-4: 8 nodes, 16 edges
const valid = verifyChromotopology(adinkra); // true
const { bosons, fermions } = bosonFermionSplit(adinkra);
```

### Topology

```ts
import { connectedComponents, eulerCharacteristic, genus, makeTopoGraph, topoAddEdge } from 'adinkra-math';

const g = makeTopoGraph(4);
topoAddEdge(g, 0, 1);
const cc = connectedComponents(g);
const chi = eulerCharacteristic(4, 6, 4); // 2
const gen = genus(chi); // 0
```

## License

MIT
