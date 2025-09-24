const resolveForm = document.getElementById("resolve-form");
const chatUI = document.getElementById("chat-ui");
const chatForm = document.getElementById("chat-form");
const eventsList = document.getElementById("events");
const roomInfo = document.getElementById("room-info");

let currentUserUUID = null;
let currentUserName = null;
let currentRoomUUID = null;
let evtSource = null;

resolveForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const uuid = document.getElementById("user-uuid").value.trim();
	if (!uuid) return;

	const res = await fetch("/resolve", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ uuid }),
	});

	const data = await res.json();
	if (data.error) {
		alert(data.error);
		return;
	}
	currentUserUUID = data.user.uuid;
	currentUserName = data.user.name;
	currentRoomUUID = data.room_uuid;

	// Switch UI
	resolveForm.style.display = "none";
	chatUI.style.display = "flex";

	roomInfo.textContent = currentRoomUUID
		? `You are in room: ${currentRoomUUID}`
		: "No room assigned yet";

	if (evtSource) evtSource.close();
	evtSource = new EventSource("/sse");

	evtSource.addEventListener("system", (e) => {
		appendMessage({ text: e.data, type: "system" });
	});

	evtSource.addEventListener("message", (e) => {
		const msg = JSON.parse(e.data);
		const isSelf = msg.user_id === currentUserUUID;
		appendMessage({
			text: msg.message,
			type: isSelf ? "user" : "other",
			timestamp: msg.timestamp,
		});
	});

	evtSource.onerror = (e) => console.error("SSE error:", e);
});

chatForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const message = document.getElementById("message").value.trim();
	if (!message) return;

	await fetch("/chat/send", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			message,
			user_id: currentUserUUID,
			room_uuid: currentRoomUUID,
			name: currentUserName,
		}),
	});

	document.getElementById("message").value = "";
});

function appendMessage({ text, type, timestamp }) {
	const li = document.createElement("li");
	li.classList.add(type);

	// message wrapper
	const msgWrapper = document.createElement("div");
	msgWrapper.classList.add("msg-wrapper");

	// message text
	const msgText = document.createElement("span");
	msgText.classList.add("msg-text");
	msgText.textContent = text;
	msgWrapper.appendChild(msgText);

	li.appendChild(msgWrapper);

	// timestamp
	if (!(type === "system" && text.toLowerCase() === "connected")) {
		const time = document.createElement("span");
		time.classList.add("timestamp");
		const dt = new Date(timestamp);
		const hours = dt.getHours().toString().padStart(2, "0");
		const minutes = dt.getMinutes().toString().padStart(2, "0");
		time.textContent = `${hours}:${minutes}`;
		li.appendChild(time);
	}

	eventsList.appendChild(li);
	eventsList.scrollTop = eventsList.scrollHeight;
}
