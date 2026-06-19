# ⚡ QUICKSTART - HACKEA UN VIRUS

## 30 segundos para empezar

```bash
# 1. Instala
npm install

# 2. Corre
npm run dev

# 3. Abre en navegador
http://localhost:5173
```

**¡Listo!** Verás la pantalla de inicio de HACKEA UN VIRUS.

---

## Controles rápidos

| Acción | Xbox | Teclado |
|--------|------|---------|
| Empezar | A | Enter |
| Navegar arriba | D-pad ↑ | ↑ |
| Navegar abajo | D-pad ↓ | ↓ |
| Seleccionar | A | Enter |
| Lanzar docking | X | X |
| Info científica | Y | I |
| Regresar | B | Escape |

---

## Flujo en 60 segundos

1. **Pantalla inicio** → Presiona A (Enter)
2. **Selecciona molécula** → Flecha ↓ para navegar → A para elegir
3. **Selecciona proteína** → Flecha ↓ → A
4. **Docking corre** → Espera 10-15 segundos (logs animados)
5. **Ve resultado** → Score, ranking, visualización 3D
6. **Info científica** → Presiona Y (o I)
7. **Repite** → A para nuevo docking, B para menú

---

## Para mostrar en feria

```bash
# Build producción
npm run build

# Sirve desde dist/
python -m http.server --directory dist 8080

# Abre
http://localhost:8080
```

Presiona F11 en navegador para pantalla completa.

---

## Xbox detectado?

- Conecta el control USB **antes** de abrir navegador
- Verifica en esquina superior derecha de la app
- Si dice "usa teclado" → intenta en otro puerto USB

---

## Primeras modificaciones

### Cambiar colores Matrix
Archivo: `src/styles/globals.css`
```css
color: #0f0;          /* Verde → cambiar aquí */
border: 1px solid #0f0;  /* Verde → cambiar aquí */
text-shadow: 0 0 10px #0f0;  /* Glow → cambiar aquí */
```

### Añadir moléculas propias
Archivo: `src/data/molecules.ts`
```typescript
{
  id: 'tu-molecula',
  name: 'Tu Molécula',
  category: 'Tu Categoría',
  molecularWeight: 300.5,
  description: 'Descripción...',
  disclaimer: 'Advertencia...',
}
```

### Cambiar mensaje educativo
Archivo: `src/components/ScienceInfo.tsx`
- Edita el contenido dentro de `<Section>`

---

## Documentación

- **README.md** - Descripción completa
- **INSTRUCCIONES.txt** - Manual detallado
- **ESTRUCTURA.md** - Architetura técnica
- **CHANGELOG.md** - Qué se implementó

---

## Próximos pasos

```bash
# Desarrollo
npm run dev        # Servidor con hot-reload

# Build
npm run build      # Producción optimizada

# Preview
npm run preview    # Ver build localmente
```

---

## ¿Problemas?

- Xbox no conecta? → Presiona A para focus navegador
- Teclas no funcionan? → Haz clic en página
- Gráficos lentos? → Cierra otras pestañas
- Quiero... → Edita archivos en `src/`

---

## 🚀 ¡Disfruta tu feria científica!

**Recuerda**: La simulación propone. El laboratorio comprueba.

```
┌─────────────────────────────────────────┐
│  > HACKEA UN VIRUS                      │
│  > docking molecular interactivo        │
│                                         │
│  ⚠️ herramienta educativa               │
│  ⚠️ simulación = hipótesis              │
│  ⚠️ validación experimental = prueba    │
└─────────────────────────────────────────┘
```

