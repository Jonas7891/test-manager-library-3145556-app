# test-manager-library-3145556-app

> **Technical test · ADSO group 3145556**: *Manager Library* frontend in **React 18 + Vite** (T-22).
> It consumes the `test-manager-library-3145556-api` API as defined in `api-contract.md`.

## Screens

Screen texts are in Spanish because users see them (ADR-015).

| Screen | Route | Role | Story |
|---|---|---|---|
| Login | — | public | HU-01 |
| Catalogue: search, create, edit, soft delete and cover | `/books` | everyone (maintenance admin only) | HU-03, HU-04 |
| Members: create, search and detail with unreturned books | `/members` | admin, librarian | HU-05 |
| Register a loan (member + 1 to 3 books) | `/loans/new` | admin, librarian | HU-06 |
| Loans: filters and return per line | `/loans` | admin, librarian | HU-07, HU-08 |
| Overdue | `/overdue` | admin, librarian | HU-09 |
| Most borrowed | `/report` | admin only | HU-10 |
| Create librarians | `/users` | admin only | HU-02 |

The menu hides from the librarian what the role does not allow, and the API checks it again on every request (403).
Errors are shown with the Spanish `message` from the single error body, plus its `details`.

Code layout after the redesign (ADR-013):
- `screens/`: one file per screen;
- `ui/`: reusable blocks;
- `lib/`: `useQuery` and formatters;
- `api/` and `auth/`: unchanged HTTP client and session.

## How to run it

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:8000/api/v1
npm install
npm run dev              # http://localhost:5173
```

Or start the whole system from `test-manager-library-3145556-infra` with `docker compose up -d --build`.

## End-to-end walkthrough (T-22 evidence)

With `infra` running and the `tool` seeder already run:

1. Log in as the admin (`Jonas7891`): the 7 menus appear.
2. **Prestar**: search for a member with no overdue loans, add 1 to 3 books and click *Registrar*. The due date (14 days)
   appears. Trying with an overdue member shows «El socio tiene libros vencidos…» (409).
3. **Préstamos**: return one line with *Devolver*. The book's available copies go up in **Catálogo**.
4. **Vencidos**: the 3 seeded lines, with the days late.
5. **Más prestados**: for this month's range, rows sorted from most to least borrowed.
6. Click *Salir* and log in as the librarian (`Juan Diego`): neither «Más prestados» nor «Bibliotecarios» appears.

`npm run build` compiles with no errors.

### Recorded walkthrough (ADR-011)

The same walkthrough runs in a real browser with `e2e/walkthrough.mjs`. It uses `playwright-core` with the Edge or Chrome
already installed, so no browser is downloaded. It makes one real loan and one real return on the demo database.

```bash
npm install
ADMIN_PASSWORD=<from .env> LIBRARIAN_PASSWORD=<from .env> npm run walkthrough   # BROWSER_CHANNEL=chrome if Edge is missing
```

Run of 13-10-2026: all 8 steps green, with one screenshot per step in [`evidence/t-22/`](evidence/t-22/).

| # | Step | Screenshot |
|---|---|---|
| 1 | Log in as admin: 7 menus | `01-login-admin.png` |
| 2 | Catalogue | `02-catalogo.png` |
| 3 | Members | `03-socios.png` |
| 4 | Lend: «Préstamo registrado», due in 14 days | `04-prestar.png` |
| 5 | Return one line | `05-devolver.png` |
| 6 | Overdue | `06-vencidos.png` |
| 7 | Most borrowed in the range | `07-reporte.png` |
| 8 | Log in as the librarian (`Juan Diego`): no «Más prestados» and no «Bibliotecarios» | `08-login-bibliotecario.png` |
