import services from "../src/config/extra/services.json";
import RethinkDB from "rethinkdbdash";
const adminUser = process.env.ADMIN_USER;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) throw new Error("Missing or invalid admin user");
if (!adminPassword) throw new Error("Missing or invalid admin password");


process.nextTick(async() => {
	const r = RethinkDB({
		host: services.db.options.host,
		port: services.db.options.port,
		user: adminUser,
		password: adminPassword,
		cursor: true
	});

	const users = await r.db("rethinkdb").table<{ id: string; password: boolean; }>("users").run().then(v => v.toArray());
	for (const u of users) if (u.id === services.db.options.user) await r.db("rethinkdb").table("users").get(u.id).delete().run();
	await r.db("rethinkdb").table("users").insert({
		id: services.db.options.user,
		password: services.db.options.password
	}).run();

	const cur = await r.dbList().run({ cursor: false });
	const db = ["furrybot", "furrybotbeta"];
	const table = ["blacklist", "guilds", "modlog", "premium", "timed", "users", "votes", "warnings"];
	for (const d of db) {
		if (cur.includes(d)) {
			console.log(`Dropping \`${d}\` database`);
			await r.dbDrop(d).run();
		}
		console.log(`Creating \`${d}\` database`);
		await r.dbCreate(d).run();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line
		await r.db(d).grant(services.db.options.user, { read: true, write: true, config: true });
	}

	for (const t of table) {
		for (const d of db) {
			console.log(`Creating \`${d}\`.\`${t}\``);
			await r.db(d).tableCreate(t, { primaryKey: "id" }).run();
		}
	}
	process.exit(0);
});
