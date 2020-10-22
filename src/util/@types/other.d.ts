interface BanListEntry {
	addedAt: string;
	addedBy: string;
	id: string;
	reason: string | null;
}

interface BanList {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	creator: string;
	entries: BanListEntry[];
	/**
	 * 0 - Public, searchable, anyone can use
	 *
	 * 1 - Unlisted, not searchable, anyone with id can use
	 *
	 * 2 - Private, not searchable, only creator can use
	 *
	 * @type {(0 | 1 | 2)}
	 * @memberof BanList
	 */
	privacy: 0 | 1 | 2;
}
