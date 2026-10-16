import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = fileURLToPath(new URL(".", import.meta.url));
const fragmentsDirectory = join(backendDirectory, "fragments");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function readFragment(name) {
  return readFile(join(fragmentsDirectory, name), "utf8");
}

function renderTemplate(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, key) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      throw new Error(`Valeur manquante pour le fragment HTML : ${key}.`);
    }
    return values[key];
  });
}

export async function renderMessierList(objects) {
  const template = await readFragment("messier-card.html");
  return objects.map((object, index) => renderTemplate(template, {
    id: escapeHtml(object.id),
    urlId: escapeHtml(encodeURIComponent(object.id)),
    name: escapeHtml(object.name),
    index: String(index + 1).padStart(2, "0"),
    type: escapeHtml(object.type),
    description: escapeHtml(object.description),
    constellation: escapeHtml(object.constellation)
  })).join("");
}

export async function renderHomePage() {
  return readFragment("home.html");
}

export async function renderCataloguePage(objects) {
  const [template, cards] = await Promise.all([
    readFragment("catalogue.html"),
    renderMessierList(objects)
  ]);
  return renderTemplate(template, {
    count: String(objects.length),
    cards
  });
}

export async function renderDetail(object) {
  const template = await readFragment("detail.html");
  return renderTemplate(template, {
    id: escapeHtml(object.id),
    name: escapeHtml(object.name),
    type: escapeHtml(object.type),
    description: escapeHtml(object.description),
    constellation: escapeHtml(object.constellation)
  });
}

export async function renderNotFound() {
  return readFragment("not-found.html");
}

export async function renderFullPage(content) {
  const template = await readFragment("layout.html");
  return renderTemplate(template, { content });
}
