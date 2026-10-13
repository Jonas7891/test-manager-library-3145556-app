# test-manager-library-3145556-app

> **Prueba técnica · Ficha ADSO 3145556**: frontend de *Manager Library* en **React 18 + Vite** (T-22).
> Consume la API de `test-manager-library-3145556-api` según `api-contract.md`.

## Pantallas

| Pantalla | Ruta | Rol | Historia |
|---|---|---|---|
| Inicio de sesión | — | público | HU-01 |
| Catálogo: búsqueda, alta, edición, baja y portada | `/books` | todos (mantenimiento solo admin) | HU-03, HU-04 |
| Socios: alta, búsqueda y detalle con libros sin devolver | `/members` | admin, bibliotecario | HU-05 |
| Registrar préstamo (socio + 1 a 3 libros) | `/loans/new` | admin, bibliotecario | HU-06 |
| Préstamos: filtros y devolución por línea | `/loans` | admin, bibliotecario | HU-07, HU-08 |
| Vencidos | `/overdue` | admin, bibliotecario | HU-09 |
| Más prestados | `/report` | solo admin | HU-10 |
| Alta de bibliotecarios | `/users` | solo admin | HU-02 |

El menú oculta al bibliotecario lo que su rol no permite; la API lo vuelve a comprobar en cada petición (403).
Los errores se muestran con el `message` en español del cuerpo de error único, más sus `details`.

## Cómo se corre

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:8000/api/v1
npm install
npm run dev              # http://localhost:5173
```

O con todo el sistema desde `test-manager-library-3145556-infra`: `docker compose up -d --build`.

## Recorrido de punta a punta (evidencia de T-22)

Con `infra` levantado y el sembrador de `tool` ejecutado:

1. Entrar como `admin` → aparecen los 7 menús.
2. **Prestar** → buscar un socio sin vencidos, añadir 1 a 3 libros, *Registrar*: aparece la fecha de vencimiento (14 días).
   Intentar con un socio vencido muestra «El socio tiene libros vencidos…» (409).
3. **Préstamos** → *Devolver* una línea; los disponibles del libro suben en **Catálogo**.
4. **Vencidos** → las 3 líneas sembradas, con los días de retraso.
5. **Más prestados** → rango del mes: filas ordenadas de mayor a menor.
6. *Salir* y entrar como `bibliotecario.demo` → no aparecen ni «Más prestados» ni «Bibliotecarios».

`npm run build` compila sin errores.

### Recorrido grabado (ADR-011)

El mismo recorrido se ejecuta en un navegador real con `e2e/walkthrough.mjs`. Usa `playwright-core` con el Edge o Chrome ya
instalado, así que no descarga navegadores. Hace un préstamo y una devolución reales sobre la base de demostración.

```bash
npm install
ADMIN_PASSWORD=<la del .env de infra> npm run walkthrough   # BROWSER_CHANNEL=chrome si no hay Edge
```

Corrida del 13-10-2026: los 8 pasos en verde, con una captura por paso en [`evidence/t-22/`](evidence/t-22/).

| # | Paso | Captura |
|---|---|---|
| 1 | Entrar como admin: 7 menús | `01-login-admin.png` |
| 2 | Catálogo | `02-catalogo.png` |
| 3 | Socios | `03-socios.png` |
| 4 | Prestar: «Préstamo registrado», vence a los 14 días | `04-prestar.png` |
| 5 | Devolver una línea | `05-devolver.png` |
| 6 | Vencidos | `06-vencidos.png` |
| 7 | Más prestados del rango | `07-reporte.png` |
| 8 | Entrar como `bibliotecario.demo`: sin «Más prestados» ni «Bibliotecarios» | `08-login-bibliotecario.png` |
