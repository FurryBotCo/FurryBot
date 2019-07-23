interface CommandConfigEntry {
	type: "command" | "category";
	selectionType: "channel" | "user" | "role" | "server";
	selection: string;
}

export default CommandConfigEntry;