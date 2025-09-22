import { Hono, Context, Client } from "../deps.ts";

export function handleCreateRoom(app: Hono, db: Client) {
	app.post("/create-room", async (c: Context) => {
		const { users } = await c.req.json<{ users: { uuid: string; name?: string }[] }>();
		if (!users?.length) return c.json({ error: "users required" }, 400);

		const room_uuid = crypto.randomUUID();

		await db.queryArray(`INSERT INTO rooms (uuid) VALUES ($1)`, [room_uuid]);

		for (const user of users) {
			const userName = user.name || "Anonymous";

			// Insert user if not exists
			await db.queryArray(
				`INSERT INTO users (uuid, name)
         VALUES ($1, $2)
         ON CONFLICT (uuid) DO NOTHING`,
				[user.uuid, userName]
			);

			// Attach user to the room
			await db.queryArray(
				`INSERT INTO user_rooms (user_uuid, room_uuid)
         VALUES ($1, $2)
         ON CONFLICT (user_uuid, room_uuid) DO NOTHING`,
				[user.uuid, room_uuid]
			);
		}

		return c.json({ room_uuid });
	});
}
