import config from "../../config";
import phin from "phin";
import refreshPatreonToken from "./refreshPatreonToken";

const loopPatrons = (async (refresh = true, url?: string) => {
	const res = await phin({
		method: "GET",
		url: url || `https://www.patreon.com/api/oauth2/api/campaigns/${config.patreon.campaignId}/pledges?include=patron.null&page%5Bcount%5D=100`,
		headers: {
			"Authorization": `Bearer ${config.patreon.accessToken}`,
			"User-Agent": config.web.userAgent
		},
		parse: "json"
	});

	const patreons = [];
	for (const patron of res.body.included) {
		if (patron.type === "user" && res.body.data.find(p => p.relationships.patron.data.id === patron.id)) {
			const pledge = res.body.data.find(p => p.relationships.patron.data.id === patron.id);
			patreons.push({ attributes: patron.attributes, payment_data: pledge ? pledge.attributes : null, id: patron.id });
		}
	}

	if (res.statusCode !== 200) {
		if (refresh) {
			await refreshPatreonToken();
			return loopPatrons(false);

		} else throw new Error("patreon access token is invalid");
	}

	if (res.body.links.next) {
		const s = await loopPatrons(true, res.body.links.next);
		if (!s || s.length < 1) { } else patreons.push(...s);
	}

	return patreons;
});

export default loopPatrons;
