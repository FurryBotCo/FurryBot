import config from "../../config";
import E6 from "e621";

const E621 = new E6(
	config.apis.e621.username,
	config.apis.e621.key,
	config.apis.e621.blacklistedTags,
	config.web.userAgent,
	true
);

export default E621;
