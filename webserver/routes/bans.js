const express = require("express"),
	app = express.Router(),
	client = require("../../"),
	{ checkAuth } = require("../functions"),
	rateLimit = require("express-rate-limit");

app.get("/:id",async(req,res) => {
	const b = await client.mdb.collection("bans").findOne({id: req.params.id});
	if(!b) return res.status(404).json({success: true, banned: false, id: req.params.id});
	return res.status(200).json({success: true, banned: true, id: req.params.id, reason: b.reason, evidence: b.evidence});
}).post("/",async(req,res,next) => {
	if(checkAuth(req,res)) next(); // authenticated, no ratelimit
	else next(rateLimit({windowMs: 18e5, max: 1})); // ratelimited 1 per 30 minutes
},async(req,res) => {
	if(checkAuth(req,res)) {
		// authenticated insertion
	} else {
		// submit report
	}
	return res.status(400).json({success: false, error: "unfinished endpoint"});
});

module.exports = app;