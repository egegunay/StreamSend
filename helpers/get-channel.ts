import { Client } from "../deps.ts";

export async function getChannelFromUUID(uuid: string, db: Client) {
	// Find their chat room
	const roomRes = await db.queryObject<{ room_uuid: string }>(
		`SELECT room_uuid FROM user_rooms WHERE user_uuid = $1`,
		[uuid]
	); // TODO: some error handling would be nice.

	const room = roomRes.rows[0];
	return room
}