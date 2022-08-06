import { Config, ConnectedAccount, DiscordApiErrors } from "@fosscord/util";
import crypto from "crypto";

export interface ConnectionOptions {
	name: string;
	authorizeUrl: string;
	tokenUrl: string;
	userInfoUrl: string;
	clientId: string;
	clientSecret: string;
	scopes: string[];
}

export interface ConnectionConfigValue {
	enabled: boolean;
	clientId: string;
	clientSecret: string;
}

export abstract class BaseConnection {
	public options: ConnectionOptions;
	public readonly states: string[] = [];

	abstract init(): void;

	createState(): string {
		const state = crypto.randomBytes(16).toString("hex");
		this.states.push(state);

		return state;
	}

	validateState(state: string): void {
		if (!this.states.includes(state)) throw DiscordApiErrors.INVALID_OAUTH_STATE;
	}

	get enabled(): boolean {
		const config = (Config.get().connections as { [key: string]: ConnectionConfigValue })[this.options.name];
		return !!(this.options.clientId && this.options.clientSecret && config.enabled);
	}

	abstract makeAuthorizeUrl(): string;

	abstract makeTokenUrl(code: string): string;

	abstract exchangeCode(code: string, state: string): Promise<string>;

	abstract getUser(token: string): Promise<unknown>;

	abstract createConnection(userId: string, token: string, friend_sync: boolean, userInfo: unknown): ConnectedAccount;
}
