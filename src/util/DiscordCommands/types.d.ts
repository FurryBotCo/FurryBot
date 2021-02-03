import { ApplicationCommandOptionType, InteractionType, VERSION, InteractionResponseType } from "./Constants";
import { AllowedMentions, EmbedOptions } from "eris";

declare namespace DiscordSlashCommands {
	interface User {
		username: string;
		public_flags: number;
		id: string;
		discriminator: string;
		avatar: string | null;
	}

	interface Member {
		user: User;
		roles: string[];
		premium_since: string | null;
		premissions: string;
		pending: boolean;
		nick: string | null;
		mute: boolean;
		joined_at: string;
		is_pending: boolean;
		deaf: boolean;
	}

	interface ApplicationCommand {
		id: string;
		application_id: string;
		name: string;
		description: string;
		options: ApplicationCommandOption[];
	}

	interface ApplicationCommandOption {
		type: typeof ApplicationCommandOptionType[keyof typeof ApplicationCommandOptionType];
		name: string;
		description: string;
		default?: boolean;
		required?: boolean;
		choices?: [
			ApplicationCommandOptionChoice?,
			ApplicationCommandOptionChoice?,
			ApplicationCommandOptionChoice?,
			ApplicationCommandOptionChoice?,
			ApplicationCommandOptionChoice?,
			ApplicationCommandOptionChoice?,
			ApplicationCommandOptionChoice?,
			ApplicationCommandOptionChoice?,
			ApplicationCommandOptionChoice?,
			ApplicationCommandOptionChoice?
		];
		options?: ApplicationCommandOption[];
	}

	interface ApplicationCommandOptionChoice {
		name: string;
		value: string;
	}

	interface Interaction {
		id: string;
		type: typeof InteractionType[keyof typeof InteractionType];
		data: ApplicationCommandInteractionData;
		guild_id: string;
		channel_id: string;
		member: Member;
		token: string;
		version: typeof VERSION;
	}

	interface ApplicationCommandInteractionData {
		id: string;
		name: string;
		options?: ApplicationCommandInteractionDataOption[];
	}

	interface ApplicationCommandInteractionDataOption {
		name: string;
		value?: unknown; // OptionType
		options?: ApplicationCommandInteractionDataOption[];
	}

	interface InteractionResponse {
		type: typeof InteractionResponseType[keyof typeof InteractionResponseType];
		data?: InteractionApplicationCommandCallbackData;
	}

	interface InteractionApplicationCommandCallbackData {
		tts?: boolean;
		allowed_mentions?: AllowedMentions;
		flags?: number;
		content?: string;
		embeds?: EmbedOptions[];
	}
}

export = DiscordSlashCommands;
