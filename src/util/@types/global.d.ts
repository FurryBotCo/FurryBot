declare const __stack: NodeJS.CallSite[];
declare const __line: number;
declare const __function: string;

declare namespace GlobalTypes {
	export type PremiumEntry = PremiumGuildEntry | PremiumUserEntry;

	interface PremiumGuildEntry {
		type: "guild";
		guildId: string;
		user: string;
		active: boolean;
		activationDate: number;
	}

	interface PremiumUserEntry {
		type: "user";
		userId: string;
		active: boolean;
		amount: number;
		activationDate: number;
		patronId: string;
	}
}

declare namespace GlobalTypes.Auto {
	interface Generic<T extends string, C extends string> {
		type: T;
		cat: C;
		channelId: string;
		webhook: {
			id: string;
			token: string;
		};
		time: number;
	}

	export type Any = Yiff<string> | Animals<string>;
	export type Yiff<C extends string> = Generic<"yiff", C>;
	export type Animals<C extends string> = Generic<"animals", C>;
}