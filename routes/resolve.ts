import { Hono, Client, Context } from "../deps.ts";

export function handleResolve(app: Hono, db: Client) {
	app.post("/resolve", async (c: Context) => {
		const { uuid } = await c.req.json<{ uuid: string }>();
		if (!uuid) return c.json({ error: "uuid required" }, 400);

		// Ensure user exists
		const userRes = await db.queryObject<{ uuid: string, name: string }>(
			`INSERT INTO users (uuid, name)
        	VALUES ($1, 'Anonymous')
        	ON CONFLICT (uuid) DO NOTHING
        	RETURNING uuid, name`,
			[uuid]
		);

		const user = userRes.rows[0] || (await db.queryObject<{ uuid: string, name: string }>(
			`SELECT uuid, name FROM users WHERE uuid = $1`,
			[uuid]
		)).rows[0];

		// Find their chat room
		const roomRes = await db.queryObject<{ room_uuid: string }>(
			`SELECT room_uuid FROM user_rooms WHERE user_uuid = $1`,
			[uuid]
		);

		const room = roomRes.rows[0];

		return c.json({ user, room_uuid: room?.room_uuid || null });
	});
}
