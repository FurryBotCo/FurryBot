// this external functions is used for evals as typescript screws with the context and variables
// this is also the reason this file is plain javascript, and not typescript

module.exports = (async function (txt, v) {
	for (const k in v) new Function("value", ` ${k} = value `)(v[k]);
	return eval(txt);
});
