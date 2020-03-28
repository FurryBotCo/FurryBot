// this external functions is used for evals as typescript screws with the context and variables
// this is also the reason this file is plain javascript, and not typescript

module.exports = (async function (txt, v) {
	const keys = Object.keys(v);
	for (let k of keys) {
		global[k] = v[k];
	}
	return eval(txt);
});
