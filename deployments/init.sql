-- Each user is just a UUID and a name
CREATE TABLE users (
	uuid UUID PRIMARY KEY,
	name TEXT NOT NULL
);

-- Each chat room is just a UUID
CREATE TABLE rooms (
	uuid UUID PRIMARY KEY
);

-- User-to-room mapping
CREATE TABLE user_rooms (
	user_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
	room_uuid UUID REFERENCES rooms(uuid) ON DELETE CASCADE,
	joined_at TIMESTAMP DEFAULT NOW(),
	PRIMARY KEY (user_uuid, room_uuid)  -- <== makes it conflict-safe
);

-- Messages
CREATE TABLE messages (
	id UUID PRIMARY KEY,
	room_uuid UUID REFERENCES rooms(uuid) ON DELETE CASCADE,
	sender_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
	content TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW()
);
