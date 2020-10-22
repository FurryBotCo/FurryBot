/// <reference path="./@types/other.d.ts" />
import db from "./Database";
import crypto from "crypto";
import { WithId } from "mongodb";

export default class BanlistUtil {
	private constructor() { }

	static get col() {
		return db.collection("banlists");
	}

	/**
	 * Get a ban list
	 *
	 * @static
	 * @param {string} id - The id of the list.
	 * @returns {BanList}
	 * @memberof BanlistUtil
	 * @example BanListUtil.getList("exampleId");
	 */
	static async getList(id: string) {
		return this.col.findOne({ id });
	}

	/**
	 * @typedef {object} BanListPrivacy
	 * @prop {boolean} accessible - If the list is accessible by the provided user.
	 * @prop {boolean} public - If the list is public.
	 * @prop {boolean} unlisted - If the list is unlisted.
	 * @prop {boolean} private - If the list is private.
	 */

	/**
	 * Check the privacy values of a list.
	 *
	 * @static
	 * @param {string} id - The id of the list.
	 * @param {string} [userId] - The id of the user to check.
	 * @returns {BanListPrivacy}
	 * @memberof BanlistUtil
	 * @example BanListUtil.checkListPrivacy("exampleId");
	 * @example BanListUtil.checkListPrivacy("exampleId", "242843345402069002");
	 */
	static async checkListPrivacy(id: string, userId?: string) {
		const list = await this.getList(id);
		if (!list) return null;
		return {
			accessible: [0, 1].includes(list.privacy) || (userId && list.creator === userId),
			public: list.privacy === 0,
			unlisted: list.privacy === 1,
			private: list.privacy === 2
		};
	}

	/**
	 * Create a ban list.
	 *
	 * @static
	 * @param {string} name - The name of the list.
	 * @param {string} description - The description of the list.
	 * @param {string} creator - The creator of the list. (Discord user id)
	 * @param {BanList["privacy"]} privacy - The privacy of the list. See {@link BanList#privacy} for values.
	 * @param {string} [overrideId] - An id value to override the randomly generated id.
	 * @returns {WithId<BanList>}
	 * @memberof BanlistUtil
	 * @example BanListUtil.createList("a list of bans", "the description", "242843345402069002", 0);
	 */
	static async createList(name: string, description: string, creator: string, privacy: BanList["privacy"], overrideId?: string) {
		const id = overrideId || crypto.randomBytes(16).toString("hex");
		const list = await this.col.insertOne({
			id,
			name,
			description,
			createdAt: new Date().toISOString(),
			creator,
			entries: [],
			privacy
		});

		return list.ops[0];
	}

	/**
	 * Delete a ban list.
	 *
	 * @static
	 * @param {string} id - The id of the list to delete.
	 * @returns {boolean}
	 * @memberof BanlistUtil
	 * @example BanListUtil.deleteList("exampleId");
	 */
	static async deleteList(id: string) {
		return this.col.findOneAndDelete({ id }).then(r => r.ok === 1);
	}

	/**
	 * Add a user entry to a ban list.
	 *
	 * @static
	 * @param {string} id - The id of the list to add to.
	 * @param {string} blame - The user that added them.
	 * @param {string} reason - The reason for adding the user.
	 * @param {string} userId - The id of the user to add.
	 * @returns
	 * @memberof BanlistUtil
	 * @example BanListUtil.addEntryToList("exampleId", "242843345402069002", "some reason", "280158289667555328");
	 */
	static async addEntryToList(id: string, blame: string, reason: string, userId: string) {
		await this.col.findOneAndUpdate({
			id
		}, {
			$push: {
				entries: {
					addedAt: new Date().toISOString(),
					addedBy: blame,
					id: userId,
					reason
				}
			}
		});
		return this.getList(id);
	}


	/**
	 * Remove a user from a ban list.
	 *
	 * @static
	 * @param {string} id - The id of the list to remove from.
	 * @param {string} userId - The id of the user to remove.
	 * @returns
	 * @memberof BanlistUtil
	 * @example BanListUtil.removeEntryFromList("exampleId", "280158289667555328");
	 */
	static async removeEntryFromList(id: string, userId: string) {
		const list = await this.getList(id);
		if (!list) return null;
		await this.col.findOneAndUpdate({
			id
		}, {
			$pull: {
				entries: list.entries.find(e => e.id === userId)
			}
		});
		return this.getList(id);
	}
}
