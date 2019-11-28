interface GenericEntry {
	action: string;
	blame: string;
	timestamp: string;
}

interface GenericRoleEntry extends GenericEntry {
	userId: string;
	reason?: string;
	role: string;
}

interface GenericPunishmentEntry extends GenericEntry {
	userId: string;
	reason?: string;
}

interface GenericPunishmentAdditionEntry extends GenericPunishmentEntry {
	time?: number;
}

interface GenericPunishmentRemovalEntry extends GenericPunishmentEntry { }

interface GenericSettingsEntry extends GenericEntry {
	setting: string;
	oldValue: any;
	newValue: any;
}

interface GenericStringSettingsEntry extends GenericSettingsEntry {
	oldValue: string;
	newValue: string;
}

interface GenericNumberSettingsEntry extends GenericSettingsEntry {
	oldValue: number;
	newValue: number;
}

interface GenericBooleanSettingsEntry extends GenericSettingsEntry {
	oldValue: boolean;
	newValue: boolean;
}


/* actual entries */

interface ModifySelfAssignableRoleEntry extends GenericRoleEntry {
	action: "addSelfAssignableRole" | "removeSelfAssignableRole";
}

interface UserSelfAssignableRoleEntry extends GenericRoleEntry {
	action: "addRole" | "removeRole";
	userId: string;
	reason?: string;
}

interface PunishmentAdditionEntry extends GenericPunishmentAdditionEntry {
	action: "ban" | "mute";
}

interface PunishmentRemovalEntry extends GenericPunishmentRemovalEntry {
	action: "unban" | "unmute" | "kick";
}
