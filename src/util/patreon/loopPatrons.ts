import config from "../../config";
import phin from "phin";
import refreshPatreonToken from "./refreshPatreonToken";

interface PatreonResponse {
	data: {
		attributes: {
			amount_cents: number;
			created_at: string;
			curreny: "USD" | string;
			declined_since?: string;
			patron_pays_fees: boolean;
			pledge_cap_cents?: number; // assumed
		};
		id: string;
		relationships: {
			patron: {
				data: {
					id: string;
					type: "user";
				};
				links: {
					related: string;
				};
			};
		};
		type: "pledge";
	}[];
	included: {
		attributes: Patron["attributes"];
		id: string;
		type: "user";
	}[];
	links: {
		first: string;
		next: string;
	};
	meta: {
		count: number;
	};
}

interface Patron {
	attributes: {
		about: string;
		created: string;
		default_country_code?: string;
		email: string;
		facebook?: string;
		first_name: string;
		full_name: string;
		gender: 0 | 1; // assumed
		image_url: string;
		is_email_verified: boolean;
		last_name?: string;
		patreon_currency: "USD" | string;
		social_connections: {
			deviantart?: any;
			discord?: {
				url: null;
				user_id: string;
			};
			facebook?: any;
			google?: any;
			instagram?: any;
			reddit?: any;
			spotify?: any;
			twitch?: any;
			twitter?: any;
			youtube?: any;
		};
		thumb_url: string;
		twitch?: string;
		twitter?: string;
		url?: string;
		vanity?: string;
		youtube?: string;
	};
	payment_data: {
		amount_cents: number;
		created_at: string;
		curreny: "USD" | string;
		declined_since?: string;
		patron_pays_fees: boolean;
		pledge_cap_cents?: number; // assumed
	};
	id: string;
	type: "user";
}

async function loopPatrons(refresh = true, url?: string): Promise<Patron[]> {
	const res = await phin<PatreonResponse>({
		method: "GET",
		url: url || `https://www.patreon.com/api/oauth2/api/campaigns/${config.patreon.campaignId}/pledges?include=patron.null&page%5Bcount%5D=100`,
		headers: {
			"Authorization": `Bearer ${config.patreon.accessToken}`,
			"User-Agent": config.web.userAgent
		},
		parse: "json"
	});

	if (res.statusCode !== 200) {
		if (refresh) {
			await refreshPatreonToken();
			return loopPatrons(false);

		} else throw new Error("Patreon access token is invalid");
	}

	const patreons = [];
	for (const patron of res.body.included) {
		if (patron.type === "user" && res.body.data.find(p => p.relationships.patron.data.id === patron.id)) {
			const pledge = res.body.data.find(p => p.relationships.patron.data.id === patron.id);
			patreons.push({ attributes: patron.attributes, payment_data: pledge ? pledge.attributes : null, id: patron.id });
		}
	}

	if (res.body.links.next) {
		const s = await loopPatrons(true, res.body.links.next);
		patreons.push(...s);
	}

	return patreons;
}

export default loopPatrons;
