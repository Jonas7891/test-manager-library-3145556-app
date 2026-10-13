// T-22: recorded end-to-end walkthrough (ADR-011).
// Needs infra running and the tool seeder already run. Usage:
//   ADMIN_PASSWORD=... node e2e/walkthrough.mjs
// Variables: APP_URL, API_URL, ADMIN_USERNAME, ADMIN_PASSWORD and LIBRARIAN_PASSWORD (required),
// LIBRARIAN_USERNAME, BROWSER_CHANNEL (msedge or chrome).
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173';
const API_URL = process.env.API_URL ?? 'http://localhost:8000/api/v1';
const ADMIN = { username: process.env.ADMIN_USERNAME ?? 'Jonas7891', password: process.env.ADMIN_PASSWORD };
const LIBRARIAN = {
  username: process.env.LIBRARIAN_USERNAME ?? 'Juan Diego',
  password: process.env.LIBRARIAN_PASSWORD,
};
const OUT = 'evidence/t-22';

if (!ADMIN.password || !LIBRARIAN.password) {
  console.error('Faltan ADMIN_PASSWORD o LIBRARIAN_PASSWORD (ADR-014).');
  process.exit(1);
}

// Read-only API calls to pick a member and a book that are valid for the loan.
async function apiGet(token, path) {
  const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function pickLoanData() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ADMIN),
  });
  const { access_token: token } = await res.json();
  const overdue = await apiGet(token, '/loans/overdue?size=50');
  const blocked = new Set(overdue.items.map((i) => i.member_name));
  const members = await apiGet(token, '/members?size=50');
  let member = null;
  for (const m of members.items.filter((x) => !blocked.has(x.full_name))) {
    const detail = await apiGet(token, `/members/${m.id}`); // the list does not include active_loans
    if (detail.active_loans < 3) { member = detail; break; }
  }
  const books = await apiGet(token, '/books?size=50');
  const book = books.items.find((b) => b.available_copies > 0);
  if (!member || !book) throw new Error('No hay socio o libro disponible: correr antes el sembrador de tool.');
  return { member, book };
}

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
let n = 0;

async function step(name, action) {
  await action();
  n += 1;
  const file = `${OUT}/${String(n).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(`ok  ${n}. ${name}  →  ${file}`);
}

async function login({ username, password }) {
  await page.goto(APP_URL);
  await page.getByLabel('Usuario').fill(username);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.getByRole('link', { name: 'Catálogo' }).waitFor();
}

const nav = async (label, heading) => {
  await page.getByRole('link', { name: label, exact: true }).click();
  await page.getByRole('heading', { name: heading }).waitFor();
};

try {
  await mkdir(OUT, { recursive: true });
  const { member, book } = await pickLoanData();

  await step('login-admin', async () => {
    await login(ADMIN);
    await page.getByRole('link', { name: 'Más prestados' }).waitFor();
    await page.getByRole('link', { name: 'Bibliotecarios' }).waitFor();
  });

  await step('catalogo', () => nav('Catálogo', 'Catálogo'));

  await step('socios', () => nav('Socios', 'Socios'));

  await step('prestar', async () => {
    await nav('Prestar', 'Registrar préstamo');
    await page.getByLabel('Buscar socio por nombre o documento').fill(member.document_number);
    await page.getByRole('button', { name: `(${member.document_number})` }).click();
    await page.getByLabel('Buscar libro por título o autor').fill(book.title);
    await page.getByRole('button', { name: `${book.title} ·` }).first().click();
    await page.getByRole('button', { name: /Registrar préstamo/ }).click();
    await page.getByText('Préstamo registrado').waitFor();
  });

  await step('devolver', async () => {
    await nav('Préstamos', 'Préstamos');
    await page.getByRole('button', { name: 'Devolver' }).first().click();
    await page.getByText('Devuelto:').waitFor();
  });

  await step('vencidos', () => nav('Vencidos', 'Libros vencidos'));

  await step('reporte', async () => {
    await nav('Más prestados', 'Libros más prestados');
    const today = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 40 * 864e5).toISOString().slice(0, 10);
    await page.getByLabel('Desde').fill(from);
    await page.getByLabel('Hasta').fill(today);
    await page.getByRole('button', { name: 'Generar' }).click();
    await page.locator('table tbody tr').first().waitFor();
  });

  await step('login-bibliotecario', async () => {
    await page.getByRole('button', { name: 'Salir' }).click();
    await login(LIBRARIAN);
    if (await page.getByRole('link', { name: 'Más prestados' }).count()) throw new Error('El bibliotecario ve «Más prestados».');
    if (await page.getByRole('link', { name: 'Bibliotecarios' }).count()) throw new Error('El bibliotecario ve «Bibliotecarios».');
  });

  console.log(`T-22: ${n} pasos en verde.`);
} catch (err) {
  console.error(`FALLO en el paso ${n + 1}: ${err.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
