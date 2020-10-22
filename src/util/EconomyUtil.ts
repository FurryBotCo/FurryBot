/// <reference path="./@types/Economy.d.ts" />
import config from "../config";
import db from "./Database";
import Logger from "./Logger";
import * as fs from "fs";
import Utility from "./Functions/Utility";
import Redis from "./Redis";

export default class EconomyUtil {
	private constructor() { }

	static CHANCE_TO_GET_ITEM = 100; // 20
	static CHANCES = {
		COMMON: 32,
		UNCOMMON: 28,
		RARE: 22,
		EPIC: 16,
		LEGENDARY: 8
	};

	static async removeOldItems(id: string) {
		const user = await db.getUser(id);
		const removed: Economy.EcoUser["inv"][number][] = [];
		const newItems = [...user.eco.inv];
		for (const item of user.eco.inv) {
			if (!Object.keys(config.eco.items).includes(item.id)) {
				newItems.splice(newItems.indexOf(item), 1);
				removed.push(item);
			} else continue;
		}
		const f = `${config.dir.config}/other/removed-items.json`;
		if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify({}));
		const old: {
			[id: string]: {
				id: string;
				amount: number;
			}[]
		} = JSON.parse(fs.readFileSync(f).toString());
		if (typeof old[id] === "undefined") old[id] = [];
		old[id].push(...removed);
		fs.writeFileSync(f, JSON.stringify(old));

		Logger.debug("EconomyUtil", `Removed ${removed.reduce((a, b) => a + b.amount, 0) || 0} items from user "${user.id}"`);

		return removed;
	}

	static async addItemToUser(userId: string, item: Economy.Items.Any, amount = 1) {
		const user = await db.getUser(userId);
		const items = [...user.eco.inv];
		const cur = items.find(m => m.id === item);
		if (cur) {
			amount += cur.amount;
			items.splice(items.indexOf(cur), 1);
		}

		items.push({
			id: item,
			amount
		});

		await user.mongoEdit({
			$set: {
				"eco.inv": items
			}
		});

		return amount;
	}

	static async removeItemFromUser(userId: string, item: Economy.Items.Any, amount = 1) {
		const user = await db.getUser(userId);
		const items = [...user.eco.inv];
		const cur = items.find(m => m.id === item);
		let res = 0;
		if (!cur) return 0;
		else {
			items.splice(items.indexOf(cur), 1);
			const a = cur.amount - amount;
			if (a > 0) {
				items.push({
					id: item,
					amount: a
				});
				res = a;
			}
			else res = 0;
		}

		await user.mongoEdit({
			$set: {
				"eco.inv": items
			}
		});

		return amount;
	}

	static async shouldGetItem(userId: string) {
		const cool = await Redis.get(`item-cooldown:${userId}`).then(v => Number(v) === 1);
		if (cool) return false;
		const chance = Math.floor(Math.random() * 100);
		if (chance <= this.CHANCE_TO_GET_ITEM) return true;
		else return false;
	}

	static async calcRarity() {
		return Utility.chooseWeighted(this.CHANCES);
	}

	static async calcItem(rarity?: ThenReturnType<typeof EconomyUtil["calcRarity"]>): Promise<typeof config["eco"]["items"]["lucky-apple"]> {
		if (!rarity) rarity = await this.calcRarity();
		const items = Object.keys(config.eco.items).filter(v => config.eco.items[v].rarity === rarity.toLowerCase());
		if (items.length === 0) return null;
		else return config.eco.items[items[Math.floor(Math.random() * items.length)]];
	}
}
