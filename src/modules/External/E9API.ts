import config from "../../config";
import E9API from "e9api";

const E9 = new E9API({
	userAgent: config.web.userAgent,
	apiKey: config.apiKeys.e621.apiKey
});

export default E9;
