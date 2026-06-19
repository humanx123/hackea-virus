# Hackea un Virus

Demo educativo de docking molecular con estetica Matrix/cyberpunk.

- Proyecto listo para correr localmente con Vite + React + TypeScript
- Incluye soporte para control Xbox y teclado
- Incluye datos locales de PDB para funcionar offline
- Pensado para que alumnos y asistentes de codigo lo puedan modificar con facilidad

## Demo en linea

- Produccion publica: [https://hackea-virus.pages.dev](https://hackea-virus.pages.dev)
- Desarrollo local con Vite: `http://localhost:5173`
- Build estatico local: `http://localhost:8080`

## Requisitos

- Node.js 18 o superior
- npm
- Opcional: control Xbox USB

## Instalacion

```bash
git clone <TU-REPO>
cd hackea-virus
npm install
```

## Ejecutar en local

```bash
npm run dev
```

Si ya tienes el build servido por el puerto local:

```bash
npm run build
python -m http.server --directory dist 8080
```

## Comandos utiles

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run deploy:pages
```

## Controles

### Control Xbox

- `A`: aceptar o continuar
- `B`: regresar o cancelar
- `X`: lanzar docking
- `Y`: informacion
- `D-pad` o stick: navegar listas y desplazar pantallas

### Teclado

- `Enter`: aceptar o continuar
- `Escape`: regresar o cancelar
- `X`: lanzar docking
- `I`: informacion
- Flechas: navegar listas y desplazar pantallas

## Estructura del proyecto

- `src/components/`: pantallas y componentes visuales
- `src/hooks/`: hooks de control y navegacion
- `src/data/`: datos de moleculas, proteinas y simulacion
- `src/styles/`: tema global y estilos base
- `public/pdb/`: estructuras locales para no depender de internet

## Como modificarlo

Si vas a trabajar con Claude Code o Codex:

1. Abre la carpeta del proyecto.
2. Cambia solo los archivos que necesites.
3. Ejecuta `npm run build` antes de compartir cambios.
4. No comitees `node_modules/` ni `dist/`.

## Flujo recomendado para estudiantes

```bash
git checkout -b mi-cambio
npm run dev
# editar archivos
npm run build
git add .
git commit -m "describe tu cambio"
git push
```

## Que contiene este repo

- Pantalla de presentacion
- Selector de moleculas y proteinas
- Simulacion de docking
- Resultados y panel cientifico
- Scroll automatico con control
- Dataset local para demo offline

## Licencia

MIT. Ver archivo [`LICENSE`](./LICENSE).

## Nota educativa

Esta aplicacion es una demostracion didactica. Las puntuaciones y simulaciones son hipotesis computacionales y no sustituyen validacion experimental.
