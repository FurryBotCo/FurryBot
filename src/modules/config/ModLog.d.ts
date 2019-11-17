import GuildConfig from "./GuildConfig";

interface Entry {
	blame: string;
	timestamp: number;
}

interface EntryWithUser extends Entry {
	userId: string;
	reason?: string;
}

interface EntryWithRole extends Entry {
	role: string;
}

export interface SelfAssignableRoleEntry extends EntryWithRole {
	action: "addSelfAssignableRole" | "removeSelfAssignableRole";
}

export interface PunishmentAdditionEntry extends EntryWithUser {
	action: "ban" | "mute";
	time?: number;
}

export interface PunishmentRemovalEntry extends EntryWithUser {
	action: "unban" | "kick" | "unmute";
}

export type PunishmentEntries = PunishmentAdditionEntry | PunishmentRemovalEntry;

export interface RoleManagmentEntry extends EntryWithUser {
	action: "addRole" | "removeRole";
	role: string;
}

export interface SettingsEntry extends Entry {
	action: "editSetting";
	setting: string;
	oldValue: any;
	newValue: any;
}

export interface StringSettingsEntry extends SettingsEntry {
	setting: "prefix" | "muteRole" | "lang";
	oldValue: string;
	newValue: string;
}

export interface BooleanSettingsEntry extends SettingsEntry {
	setting: "nsfw" | "fResponse" | "commandImages";
	oldValue: boolean;
	newValue: boolean;
}


export type SettingsEntries = StringSettingsEntry | BooleanSettingsEntry;

export interface ResetSettingsEntry extends Entry {
	action: "resetSettings";
	blame: string;
	old: GuildConfig;
}

export interface EditChannelEntry extends Entry {
	action: "editChannel";
	edit: "name" | "topic";
	oldValue?: string;
	newValue: string;
	channelId: string;
	reason?: string;
}

export interface PurgeMessagesEntry extends Entry {
	action: "purgeMessages";
	blame: string;
	count: number;
	actual: number;
}

export type Entries = SelfAssignableRoleEntry | PunishmentEntries | RoleManagmentEntry | SettingsEntries | ResetSettingsEntry | EditChannelEntry | PurgeMessagesEntry;
