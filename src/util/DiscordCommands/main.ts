import Types from "./types";
import fetch from "node-fetch";

export default class CommandHelper {
	token: string;
	id: string;
	constructor(token: string, id: string) {
		this.token = token;
		this.id = id;
	}

	async fetchGlobalCommands(): Promise<Types.ApplicationCommand[]> {
		return fetch(`https://discordapp.com/api/v8/applications/${this.id}/commands`, {
			method: "GET",
			headers: {
				Authorization: `Bot ${this.token}`
			}
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async createGlobalCommand(name: string, description: string, options: Types.ApplicationCommandOption[]): Promise<Types.ApplicationCommand> {
		return fetch(`https://discordapp.com/api/v8/applications/${this.id}/commands`, {
			method: "POST",
			headers: {
				"Authorization": `Bot ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name,
				description,
				options
			})
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async editGlobalCommand(commandId: string, name: string, description: string, options: Types.ApplicationCommandOption[]): Promise<Types.ApplicationCommand> {
		return fetch(`https://discordapp.com/api/v8/applications/${this.id}/commands/${commandId}`, {
			method: "PATCH",
			headers: {
				"Authorization": `Bot ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name,
				description,
				options
			})
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async deleteGlobalCommand(commandId: string): Promise<Types.ApplicationCommand> {
		return fetch(`https://discordapp.com/api/v8/applications/${this.id}/commands/${commandId}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bot ${this.token}`
			}
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async fetchGuildCommands(guildId: string): Promise<Types.ApplicationCommand[]> {
		return fetch(`https://discordapp.com/api/v8/applications/${this.id}/guilds/${guildId}/commands`, {
			headers: {
				Authorization: `Bot ${this.token}`
			}
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async createGuildCommand(guildId: string, name: string, description: string, options: Types.ApplicationCommandOption[]): Promise<Types.ApplicationCommand> {
		return fetch(`https://discordapp.com/api/v8/applications/${this.id}/guilds/${guildId}/commands`, {
			method: "POST",
			headers: {
				"Authorization": `Bot ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name,
				description,
				options
			})
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async editGuildCommand(guildId: string, commandId: string, name: string, description: string, options: Types.ApplicationCommandOption[]): Promise<Types.ApplicationCommand> {
		return fetch(`https://discordapp.com/api/v8/applications/${this.id}/guilds/${guildId}/commands/${commandId}`, {
			method: "PATCH",
			headers: {
				"Authorization": `Bot ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name,
				description,
				options
			})
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async deleteGuildCommand(guildId: string, commandId: string): Promise<Types.ApplicationCommand> {
		return fetch(`https://discordapp.com/api/v8/applications/${this.id}/guilds/${guildId}/commands/${commandId}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bot ${this.token}`
			}
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async createInteractionResponse(interactionId: string, interactionToken: string, type: Types.InteractionResponse["type"], data?: Types.InteractionResponse["data"]): Promise<void> {
		return fetch(`https://discordapp.com/api/v8/interactions/${interactionId}/${interactionToken}/callback`, {
			method: "POST",
			headers: {
				"Authorization": `Bot ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				type,
				data
			})
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async editOriginalInteractionResponse(interactionToken: string, type: Types.InteractionResponse["type"], data?: Types.InteractionResponse["data"]): Promise<unknown> {
		return fetch(`https://discordapp.com/api/v8/webhooks/${this.id}/${interactionToken}/messages/@original`, {
			method: "PATCH",
			headers: {
				"Authorization": `Bot ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				type,
				data
			})
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async deleteOriginalInteractionResponse(interactionToken: string, type: Types.InteractionResponse["type"], data?: Types.InteractionResponse["data"]): Promise<unknown> {
		return fetch(`https://discordapp.com/api/v8/webhooks/${this.id}/${interactionToken}/messages/@original`, {
			method: "DELETE",
			headers: {
				"Authorization": `Bot ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				type,
				data
			})
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}

	async createFollowupResponse(applicationId: string, interactionToken: string, data: Types.InteractionResponse["data"]): Promise<void> {
		return fetch(`https://discordapp.com/api/v8/webhooks/${applicationId}/${interactionToken}`, {
			method: "POST",
			headers: {
				"Authorization": `Bot ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(data)
		})
			.then(async (res) => {
				let b, s = await res.text();
				try {
					b = JSON.parse(s);
					s = JSON.stringify(b);
				} catch (e) {
					b = s;
				}
				if (res.status >= 400) throw new TypeError(`Unexpected ${res.status}: ${s}`);
				else return b;
			});
	}
}
