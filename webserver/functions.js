const config = require("../config");

module.exports = ({
	checkAuth: ((req,res,next) => {
		if(!next) return !((!req.headers.authorization || req.headers.authorization !== config.serverOptions.apiKey) && (!req.query.auth || req.query.auth !== config.serverOptions.apiKey));
		if((!req.headers.authorization || req.headers.authorization !== config.serverOptions.apiKey) && (!req.query.auth || req.query.auth !== config.serverOptions.apiKey)) return res.status(401).json({
			success: false,
			error: "invalid credentials"
		});
		next();
	})
});