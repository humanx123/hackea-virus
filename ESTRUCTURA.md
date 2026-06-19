# Estructura del Proyecto HACKEA UN VIRUS

## Árbol de directorios

```
hackea-virus/
├── src/
│   ├── App.tsx                          # Orquestador principal, maneja estado global
│   ├── main.tsx                         # Punto de entrada React
│   ├── index.css                        # Estilos globales (Matrix/cyberpunk)
│   │
│   ├── types/
│   │   └── index.ts                     # Definiciones TypeScript de tipos
│   │       - Screen, Molecule, Protein, DockingResult
│   │       - GamepadInput, etc.
│   │
│   ├── hooks/
│   │   ├── useGamepad.ts                # Web Gamepad API para Xbox USB
│   │   │   - Detección de gamepad
│   │   │   - Mapeo de botones Xbox
│   │   │   - Deadzone para sticks
│   │   │   - Polling a 60Hz
│   │   │
│   │   └── useKeyboardControls.ts       # Fallback teclado
│   │       - Mapeo: Enter→A, Escape→B, X→X, I→Y
│   │       - Flechas para navegación
│   │       - Debounce de 100ms
│   │
│   ├── data/
│   │   ├── molecules.ts                 # Base de 8 moléculas
│   │   │   - Quercetina, Curcumina, Remdesivir, etc.
│   │   │   - Peso molecular, categoría, descripción
│   │   │
│   │   ├── proteins.ts                  # Base de 5 proteínas virales
│   │   │   - Proteasa, Polimerasa, Helicasa, etc.
│   │   │   - Función viral, por qué es blanco
│   │   │
│   │   └── simulatedDocking.ts          # Motor de simulación
│   │       - Baselines de afinidad (kcal/mol)
│   │       - Scoring realista
│   │       - Tiempos 8-15s
│   │       - Ranking: low/medium/high
│   │
│   └── components/
│       ├── MatrixRain.tsx               # Fondo animado
│       │   - Canvas 2D con caracteres cayendo
│       │   - Rain effect verde fosforescente
│       │   - Cleanup de requestAnimationFrame
│       │
│       ├── GamepadStatus.tsx            # Indicador esquina superior derecha
│       │   - Muestra si Xbox detectado
│       │   - Fallback a teclado si no hay gamepad
│       │
│       ├── StartScreen.tsx              # Pantalla 1: Inicio
│       │   - Título "HACKEA UN VIRUS"
│       │   - Descripción y disclaimer
│       │   - Botón A para continuar
│       │
│       ├── MoleculeSelector.tsx         # Pantalla 2: Selección molécula
│       │   - Lista navegable (↑↓)
│       │   - Muestra detalles de molécula seleccionada
│       │   - A selecciona, B regresa
│       │
│       ├── ProteinSelector.tsx          # Pantalla 3: Selección proteína
│       │   - Lista navegable (↑↓)
│       │   - Muestra función y racionalidad
│       │   - A selecciona, B regresa
│       │
│       ├── DockingConsole.tsx           # Pantalla 4: Simulación
│       │   - Consola terminal simulada
│       │   - Logs animados (7-9 etapas)
│       │   - Barra de progreso 0-100%
│       │   - Duración: 8-15s
│       │
│       ├── ResultScreen.tsx             # Pantalla 5: Resultados
│       │   - Molécula + Proteína seleccionadas
│       │   - Score en kcal/mol
│       │   - Ranking visual (◆◆◆, ◆◆, ◆)
│       │   - MolecularViewer integrado
│       │   - Advertencias científicas
│       │   - A repetir, Y info, B menú
│       │
│       ├── ScienceInfo.tsx              # Pantalla 6: Información científica
│       │   - Explicación educativa
│       │   - 6 secciones temáticas
│       │   - Lenguaje accesible
│       │   - Cierre: "La simulación propone..."
│       │
│       └── MolecularViewer.tsx          # Sub-componente visualización 3D
│           - Canvas 2D esquemático
│           - Proteína como esferas wireframe
│           - Ligando como esfera rotante
│           - Líneas de interacción simuladas
│           - Animación continua
│
├── index.html                           # HTML template
├── vite.config.ts                       # Configuración Vite
├── tsconfig.json                        # Configuración TypeScript
├── tsconfig.app.json                    # Extensión para app
├── tsconfig.node.json                   # Extensión para build tools
├── package.json                         # Dependencias (React 19.2, Vite 8.0)
├── .gitignore
│
├── README.md                            # Documentación principal (en)
├── INSTRUCCIONES.txt                    # Manual de uso (en español)
├── CHANGELOG.md                         # Historial de cambios
├── ESTRUCTURA.md                        # Este archivo
│
├── dist/                                # Carpeta build (creada por npm run build)
│   ├── index.html
│   ├── assets/
│   │   ├── index-HASH.js               # Bundle main
│   │   └── index-HASH.css              # Bundle CSS
│   └── ...
│
└── node_modules/                        # Dependencias npm

```

## Flujo de datos

```
App.tsx (estado global)
  ↓
useGamepad() + useKeyboardControls()
  ↓
Pantalla actual basada en state
  ↓
User input → State change → Siguiente pantalla
  ↓
Datos desde data/ (molecules.ts, proteins.ts, simulatedDocking.ts)
  ↓
Pantalla renderiza con components/
```

## Paleta de colores

- **Fondo**: #000 (negro puro)
- **Texto principal**: #0f0 (verde fosforescente)
- **Texto secundario**: #0a0 (verde oscuro)
- **Advertencias/Errores**: #f0a (magenta)
- **Glow**: box-shadow 0 0 Xpx #0f0, #0a0, #f0a

## Fuentes

- **Monospace**: "Courier New", monospace (todo el sitio)
- **Tamaños**: 11px-48px según contexto

## Responsive Design

- Funciona en 800x600 hasta UHD (3840x2160)
- Usa viewport width/height relativo
- Soporta portrait y landscape
- Pantalla completa (F11) recomendada para ferias

## Integración futura: Backend real

Archivo a reemplazar/extender: `src/data/simulatedDocking.ts`

```typescript
// Nuevo servicio para docking real:
export async function realDocking(
  moleculeId: string, 
  proteinId: string
): Promise<DockingResult> {
  const res = await fetch('http://api-server/docking', {
    method: 'POST',
    body: JSON.stringify({ moleculeId, proteinId })
  });
  return res.json();
}

// Cambio en DockingConsole.tsx:
// const result = await simulateDocking(...);
// ↓
// const result = await realDocking(...);
```

## Testing checklist

- [ ] npm install → sin errores
- [ ] npm run dev → compila y sirve
- [ ] npm run build → producción exitosa
- [ ] Pantalla inicio se ve
- [ ] Gamepad status muestra correcto
- [ ] Enter avanza pantallas
- [ ] Flechas navegan listas
- [ ] Docking corre 8-15s
- [ ] Resultados muestran score
- [ ] Info científica es legible
- [ ] Colores Matrix visibles
- [ ] Lluvia de fondo está animada
- [ ] Sin errores en console
- [ ] Build optimizado (~67KB gzip)

## Performance

- **Initial Load**: ~300ms (Vite dev)
- **Build Size**: 218.5KB js, 1.0KB css (gzipped: 67.5KB)
- **FPS**: 60fps (Canvas animation + matriz)
- **Memory**: ~30-50MB (React + Canvas)
- **Offline**: 100% funcional sin internet

## Notas de desarrollo

1. **App.tsx es el corazón** - maneja todos los estados
2. **Cada pantalla es independiente** - fácil de reutilizar
3. **Datos separados de lógica** - modificable sin tocar componentes
4. **Types en un solo lugar** - mantiene consistencia
5. **Hooks reutilizables** - gamepad/keyboard pueden usarse en otros proyectos
6. **CSS puro sin dependencias** - sin Tailwind, sin Bootstrap
7. **Sin estado global** - todo pasa por props y hooks
8. **Cleanup correcto** - event listeners y animations se limpian

## Archivos a modificar para customizar

- `data/molecules.ts` → añade tus moléculas
- `data/proteins.ts` → añade tus proteínas
- `styles/globals.css` → cambia colores/fuentes
- `components/StartScreen.tsx` → texto personalizado
- `components/ScienceInfo.tsx` → contenido educativo
- `data/simulatedDocking.ts` → lógica scoring

Todo está claramente documentado y tipado.
