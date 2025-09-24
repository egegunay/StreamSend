import { Hono, Context } from "../deps.ts";
import { clients } from "../main.ts";

export function handleSend(app: Hono) {
	app.post("/chat/send", async (c: Context) => {
		try {
			const payload = await c.req.json<{ user_id: string; message: string }>();

			if (!payload.user_id || !payload.message) {
				return c.json({ error: "Invalid payload" }, 400);
			}

			const injected = {
				...payload,
				timestamp: new Date().toISOString(),
			};

			const message = JSON.stringify(injected);

			for (const [, send] of clients) {
				send(message);
			}

			return c.json({ ok: true }, 200);
		} catch (err) {
			console.error("Error handling /chat/send:", err);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	});
}