import config from "@config";

export default {
	checkAuth: ((req, res, next) => {
		if (!next) return !((!req.headers.authorization || req.headers.authorization !== config.universalKey) && (!req.query.auth || req.query.auth !== config.universalKey));
		if ((!req.headers.authorization || req.headers.authorization !== config.universalKey) && (!req.query.auth || req.query.auth !== config.universalKey)) return res.status(401).json({
			success: false,
			error: "invalid credentials"
		});
		next();
	})
};