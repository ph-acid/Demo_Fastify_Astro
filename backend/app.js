import Fastify from "fastify";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { messier } from "./messier.js";
import {
  renderDetail,
  renderFullPage,
  renderCataloguePage,
  renderHomePage,
  renderMessierList
} from "./render.js";

const backendDirectory = fileURLToPath(new URL(".", import.meta.url));
const publicDirectory = join(backendDirectory, "..", "public");

export async function buildServer(options = {}) {
  const app = Fastify(options);

  app.get("/", async (_request, reply) => {
    reply.type("text/html; charset=utf-8");
    return renderFullPage(renderHomePage());
  });
  
  app.get("/health", async () => {
    return { status: 'online' };
  });
  
  app.get("/styles.css", async (_request, reply) => {
    const stylesheet = await readFile(join(publicDirectory, "styles.css"), "utf8");
    reply.type("text/css; charset=utf-8");
    return stylesheet;
  });

  app.get("/catalogue", async (request, reply) => {
    reply.type("text/html; charset=utf-8");
    const catalogue = renderCataloguePage(messier);
    if (request.headers["hx-request"] === "true") {
      return catalogue;
    }
    return renderFullPage(catalogue);
  });

  app.get("/messier", async (request, reply) => {
    reply.type("text/html; charset=utf-8");
    const messierList = renderMessierList(messier);
    if (request.headers["hx-request"] === "true") {
      return messierList;
    }
    return renderFullPage(renderCataloguePage(messier));
  });

  app.get("/messier/:id", async (request, reply) => {
    const object = messier.find(({ id }) => id.toLowerCase() === request.params.id.toLowerCase());
    if (!object) {
      reply.code(404).type("text/html; charset=utf-8");
      const notFound = `
        <section class="detail-page" aria-labelledby="not-found-title">
          <h1 id="not-found-title">Objet Messier introuvable</h1>
          <a class="detail-back" href="/catalogue">← RETOUR AU CATALOGUE</a>
        </section>
      `;
      if (request.headers["hx-request"] === "true") {
        return notFound;
      }
      return renderFullPage(notFound);
    }

    const detail = renderDetail(object);
    reply.type("text/html; charset=utf-8");
    if (request.headers["hx-request"] === "true") {
      return detail;
    }
    return renderFullPage(detail);
  });

  return app;
}
