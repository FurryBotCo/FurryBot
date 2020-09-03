import ClientEvent from "../../util/ClientEvent";

export default new ClientEvent("rawREST", async function (request) {
	return; // way too spammy
	console.log(request);
});
