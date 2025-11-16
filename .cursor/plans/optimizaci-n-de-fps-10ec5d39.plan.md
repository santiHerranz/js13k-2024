<!-- 10ec5d39-302a-4437-af5f-02971885ec48 6f702992-c3b2-48de-8ac7-191fac503765 -->
# Plan de Optimización de FPS

## Problemas Identificados

1. **Game Loop**: `requestAnimationFrame` se llama siempre, incluso cuando no se actualiza el frame
2. **Sorting en cada frame**: Se ordena un array grande en cada frame (línea 808 de `game.state.ts`)
3. **Creación de arrays**: Uso excesivo de spread operators creando nuevos arrays en cada frame
4. **Bucles anidados**: Múltiples `forEach` anidados para colisiones y daño
5. **Filtros repetidos**: Arrays filtrados múltiples veces innecesariamente
6. **Quadtree reconstruido**: Se limpia y reconstruye el quadtree varias veces por frame
7. **Partículas**: Actualización y dibujo de partículas globales en cada frame
8. **Operaciones de canvas**: Muchas operaciones de `save/restore` del contexto

## Optimizaciones a Implementar

### 1. Optimizar Game Loop (`src/index.ts`)

- Mover `requestAnimationFrame` dentro del bloque condicional para evitar llamadas innecesarias
- Optimizar el cálculo de delta time

### 2. Optimizar Renderizado de Objetos (`src/game-states/game.state.ts`)

- Cachear el array combinado de objetos a dibujar en lugar de crearlo con spread en cada frame
- Usar un array pre-ordenado o ordenar solo cuando sea necesario
- Implementar culling básico para objetos fuera de pantalla

### 3. Optimizar Sistema de Partículas (`src/game/game-particle.ts`)

- Usar pool de objetos para partículas en lugar de crear/eliminar constantemente
- Optimizar el bucle de actualización usando índices en lugar de `splice`
- Dibujar partículas solo si están visibles

### 4. Optimizar Colisiones (`src/game-states/game.state.ts`)

- Cachear arrays filtrados (enemies, bullets por team, etc.)
- Reducir reconstrucciones del quadtree
- Optimizar bucles de detección de daño usando early returns

### 5. Optimizar Operaciones de Canvas (`src/core/draw-engine.ts`)

- Reducir operaciones de `save/restore` agrupando operaciones similares
- Cachear propiedades del contexto que no cambian frecuentemente
- Usar `willReadFrequently: false` en getContext si es posible

### 6. Optimizar Filtros y Arrays (`src/game-states/game.state.ts`)

- Cachear resultados de filtros que se usan múltiples veces
- Usar `for` loops en lugar de `forEach` donde sea crítico para rendimiento
- Evitar crear nuevos arrays con spread operators innecesariamente

## Archivos a Modificar

- `src/index.ts` - Game loop
- `src/game-states/game.state.ts` - Lógica principal del juego
- `src/game/game-particle.ts` - Sistema de partículas
- `src/core/draw-engine.ts` - Motor de dibujo (si es necesario)

### To-dos

- [ ] Optimizar el game loop en index.ts para evitar llamadas innecesarias a requestAnimationFrame
- [ ] Optimizar el renderizado de objetos: cachear arrays combinados y reducir sorting innecesario
- [ ] Optimizar sistema de partículas: usar pool de objetos y optimizar bucles de actualización
- [ ] Optimizar sistema de colisiones: cachear arrays filtrados y reducir reconstrucciones del quadtree
- [ ] Reducir operaciones de canvas: agrupar save/restore y cachear propiedades del contexto
- [ ] Cachear resultados de filtros y usar loops más eficientes donde sea crítico