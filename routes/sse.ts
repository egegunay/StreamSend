import { Context, Hono, streamSSE } from "../deps.ts";
import { clients } from "../main.ts";

export function handleSSEConnection(app: Hono) {
	app.get("/sse", (c: Context) => {
		return streamSSE(c, async (stream) => {
			const id = crypto.randomUUID();

			clients.set(id, async (data: string) => {
				try {
					await stream.writeSSE({ event: "message", data });
				} catch (err) {
					console.error(`SSE write failed for client ${id}:`, err);
					clients.delete(id);
				}
			});
			stream.writeSSE({ event: "system", data: "connected" });
			console.log(`[SSE] Client connected: ${id}`);

			stream.onAbort(() => {
				clients.delete(id);
				console.log(`Client ${id} disconnected`);
			});

			await new Promise(() => { });
		});
	});
}