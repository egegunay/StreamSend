import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import { serveStatic } from "jsr:@hono/hono/deno";
import { handleSSEConnection, handleSend, handleCreateRoom, handleResolve } from "./routes/index.ts";
import { client } from "./db.ts";

export const app = new Hono();
app.use("*", cors());

export const clients = new Map<string, (data: string) => void>();
app.get("/*", serveStatic({ root: "./dashboard" }));
handleSSEConnection(app);
handleSend(app, client);
handleCreateRoom(app, client);
handleResolve(app, client);

Deno.serve(app.fetch);