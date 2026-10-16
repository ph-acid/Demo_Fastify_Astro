import Fastify from "fastify";
import cors from '@fastify/cors';
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { messier } from "./messier.js";
import {
  renderDetail,
  renderFullPage,
  renderCataloguePage,
  renderHomePage,
  renderMessierList,
  renderNotFound
} from "./render.js";

const backendDirectory = fileURLToPath(new URL(".", import.meta.url));
const publicDirectory = join(backendDirectory, "..", "public");

function renderPageOrFragment(request, content) {
  if (request.headers["hx-request"] === "true") {
    return content;
  }
  return renderFullPage(content);
}

export async function buildServer(options = {}) {
  const app = Fastify(options);
  await app.register(cors);

  app.get("/", async (_request, reply) => {
    reply.type("text/html; charset=utf-8");
    return renderFullPage(await renderHomePage());
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

    const catalogue = await renderCataloguePage(messier);
    return renderPageOrFragment(request, catalogue);
  });

  app.get("/messier", async (request, reply) => {
    reply.type("text/html; charset=utf-8");

    if (request.headers["hx-request"] === "true") {
      return await renderMessierList(messier);
    }
    return renderFullPage(await renderCataloguePage(messier));
  });

  app.get("/messier/:id", async (request, reply) => {
    const object = messier.find(({ id }) => id.toLowerCase() === request.params.id.toLowerCase());
    if (!object) {
      reply.code(404).type("text/html; charset=utf-8");
      const notFound = await renderNotFound();
      return renderPageOrFragment(request, notFound);
    }

    const detail = await renderDetail(object);
    reply.type("text/html; charset=utf-8");
    return renderPageOrFragment(request, detail);
  });

  return app;
}
