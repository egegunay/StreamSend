import { Client } from "./deps.ts";
import "jsr:@std/dotenv/load";

const clientConfig = {
	hostname: Deno.env.get('DB_HOST') || "localhost",
	port: parseInt(Deno.env.get('DB_PORT') || "5432"),
	user: Deno.env.get('DB_USER') || "postgres",
	password: Deno.env.get('DB_PASSWORD') || "password",
	database: Deno.env.get('DB_NAME') || "postgres",
};

export const client = new Client(clientConfig);

try {
	await client.connect();
	console.log("Database connected successfully!");
} catch (e) {
	console.error("Database connection failed:", e);
	console.error("Connection config:", clientConfig);
	if (e instanceof Deno.errors.ConnectionRefused) {
		console.error("Connection refused - check if database is running and accessible");
	}
}