import { Hono, Context, Client } from "../deps.ts";
import { getChannelFromUUID } from "../helpers/get-channel.ts";
import { clients } from "../main.ts";

export function handleSend(app: Hono, db: Client) {
	app.post("/chat/send", async (c: Context) => {
		try {
			const payload = await c.req.json<{ user_id: string; message: string }>();

			if (!payload.user_id || !payload.message) {
				return c.json({ error: "Invalid payload" }, 400);
			}

			const time = new Date().toISOString();
			const message_uuid = crypto.randomUUID();
			const room_uuid = (await getChannelFromUUID(payload.user_id, db)).room_uuid

			await db.queryArray(
				`INSERT INTO messages (id, room_uuid, sender_uuid, content, created_at)
				VALUES ($1, $2, $3, $4, $5)
		 		ON CONFLICT (id) DO NOTHING`,
				[message_uuid, room_uuid, payload.user_id, payload.message, time]
			); // TODO: Handle db interactions somewhere else

			const message = JSON.stringify({
				...payload,
				timestamp: time,
			});

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