import config from "../../config";
import E6 from "e621";
import os from "node:os";

const E621 = new E6(
	config.apis.e621.username,
	config.apis.e621.key,
	config.apis.e621.blacklistedTags,
	config.web.userAgent,
	true,
	os.hostname() === "DONOVAN-PC" ? "real.e621.net" : "e621.net",
	true
);

export default E621;
