import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = fileURLToPath(new URL(".", import.meta.url));
const publicDirectory = join(backendDirectory, "..", "public");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderMessierList(objects) {
  return objects.map((object, index) => `
    <a
      class="object-card"
      href="/messier/${encodeURIComponent(object.id)}"
      hx-get="/messier/${encodeURIComponent(object.id)}"
      hx-target="#page-content"
      hx-push-url="true"
      aria-label="Voir le détail de ${escapeHtml(object.name)}"
    >
      <div class="card-topline">
        <span class="object-number">${escapeHtml(object.id)}</span>
        <span class="object-index">${String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3>${escapeHtml(object.name)}</h3>
      <p class="object-type">${escapeHtml(object.type)}</p>
      <p class="object-description">${escapeHtml(object.description)}</p>
      <div class="object-location">
        <span class="location-dot" aria-hidden="true"></span>
        ${escapeHtml(object.constellation)}
      </div>
    </a>
  `).join("");
}

export function renderHomePage() {
  return `
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="eyebrow-line"></span> UN INVENTAIRE COSMIQUE</p>
        <h1 id="page-title">Le ciel est<br>plus <span>vaste.</span></h1>
        <p class="hero-description">Dix premières escales dans le catalogue Messier. Nébuleuses, amas d'étoiles et vestiges stellaires à portée de regard.</p>
        <a class="explore-link" href="#catalogue">
          <span class="explore-icon" aria-hidden="true">↓</span>
          EXPLORER LE CATALOGUE
        </a>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="orbit orbit-one"></div>
        <div class="orbit orbit-two"></div>
        <div class="orbit orbit-three"></div>
        <div class="nebula nebula-a"></div>
        <div class="nebula nebula-b"></div>
        <div class="hero-star hero-star-a"></div>
        <div class="hero-star hero-star-b"></div>
        <div class="hero-star hero-star-c"></div>
        <div class="hero-star hero-star-d"></div>
        <div class="hero-star hero-star-e"></div>
        <div class="hero-star hero-star-f"></div>
        <span class="art-label art-label-top">RA 05h 34m</span>
        <span class="art-label art-label-bottom">DISTANCE INFINIE</span>
        <span class="art-caption">FIG. 01 <span>—</span> CARTOGRAPHIE CÉLESTE</span>
      </div>
    </section>
    <section class="catalogue" id="catalogue" aria-labelledby="catalogue-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow"><span class="eyebrow-line"></span> LE CATALOGUE</p>
          <h2 id="catalogue-title">Premières coordonnées<span>.</span></h2>
        </div>
        <p class="catalogue-count"><strong>10</strong><span>OBJETS<br>À EXPLORER</span></p>
      </div>
      <div
        class="object-grid"
        id="messier-list"
        aria-live="polite"
        hx-get="/messier"
        hx-trigger="load"
        hx-swap="innerHTML"
      >
        <p class="loading-message">Chargement du catalogue…</p>
      </div>
      <noscript>
        <p class="noscript-message">Active JavaScript pour charger le catalogue avec HTMX.</p>
      </noscript>
    </section>
  `;
}

export function renderCataloguePage(objects) {
  return `
    <section class="catalogue" id="catalogue" aria-labelledby="catalogue-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow"><span class="eyebrow-line"></span> LE CATALOGUE</p>
          <h1 id="catalogue-title">Premières coordonnées<span>.</span></h1>
        </div>
        <p class="catalogue-count"><strong>${objects.length}</strong><span>OBJETS<br>À EXPLORER</span></p>
      </div>
      <div class="object-grid" id="messier-list" aria-live="polite">
        ${renderMessierList(objects)}
      </div>
    </section>
  `;
}

export function renderDetail(object) {
  return `
    <section class="detail-page" aria-labelledby="object-title">
      <a
        class="detail-back"
        href="/"
        hx-get="/catalogue"
        hx-target="#page-content"
        hx-push-url="/"
      >
        <span aria-hidden="true">←</span> RETOUR AU CATALOGUE
      </a>
      <div class="detail-layout">
        <div class="detail-copy">
          <p class="eyebrow"><span class="eyebrow-line"></span> FICHE D'OBSERVATION</p>
          <p class="detail-number">${escapeHtml(object.id)}</p>
          <h1 id="object-title">${escapeHtml(object.name)}</h1>
          <p class="detail-type">${escapeHtml(object.type)}</p>
          <p class="detail-description">${escapeHtml(object.description)}</p>
          <dl class="detail-facts">
            <div>
              <dt>CONSTELLATION</dt>
              <dd>${escapeHtml(object.constellation)}</dd>
            </div>
            <div>
              <dt>CATALOGUE</dt>
              <dd>Messier</dd>
            </div>
            <div>
              <dt>REPÈRE</dt>
              <dd>${escapeHtml(object.id)}</dd>
            </div>
          </dl>
        </div>
        <div class="detail-art" aria-hidden="true">
          <div class="detail-orbit detail-orbit-one"></div>
          <div class="detail-orbit detail-orbit-two"></div>
          <div class="detail-glow"></div>
          <span class="detail-art-id">${escapeHtml(object.id)}</span>
          <span class="detail-art-caption">OBJET CÉLESTE <span>✳</span></span>
        </div>
      </div>
    </section>
  `;
}

export async function renderFullPage(content) {
  const template = await readFile(join(publicDirectory, "index.html"), "utf8");
  const marker = "<!-- PAGE_CONTENT -->";
  if (!template.includes(marker)) {
    throw new Error("Le modèle HTML ne contient pas le marqueur PAGE_CONTENT.");
  }
  return template.replace(marker, content);
}
