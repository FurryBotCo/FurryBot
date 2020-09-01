declare namespace Socials {

	type AnySocial = Twitter | Reddit | DiscordBio | Website | Patreon;

	interface Twitter {
		type: "twitter";
		username: string;
		id: string;
	}

	interface Reddit {
		type: "reddit";
		username: string;
		id: string;
	}

	interface DiscordBio {
		type: "discord.bio";
		id: string; // used id because we need a common format here
		slug: string; // can change very easily but who cares
	}

	interface Website {
		type: "website";
		id: string; // the verification meta
		url: string;
	}

	interface Patreon {
		type: "patreon";
		id: string;
		amount: number;
	}
}
