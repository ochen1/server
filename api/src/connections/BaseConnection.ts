import { Config, ConnectedAccount, DiscordApiErrors } from "@fosscord/util";
import crypto from "crypto";

export interface ConnectionOptions {
	id: string;
	authorizeUrl: string;
	tokenUrl: string;
	userInfoUrl: string;
	scopes: string[];
}

export interface ConnectionConfigValue {
	enabled: boolean;
	clientId: string;
	clientSecret: string;
}

export interface OAuthTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
	refresh_token?: string;
	expires_in?: number;
}

export abstract class BaseConnection {
	public options: ConnectionOptions;
	public enabled: boolean = false;
	public clientId: string;
	public clientSecret: string;
	public readonly states: string[] = [];

	constructor(options: ConnectionOptions) {
		this.options = options;
	}

	init(): void {
		const config = (Config.get().connections as { [key: string]: ConnectionConfigValue })[this.options.id];
		this.enabled = config.enabled;
		this.clientId = config.clientId;
		this.clientSecret = config.clientSecret;
	}

	createState(): string {
		const state = crypto.randomBytes(16).toString("hex");
		this.states.push(state);

		return state;
	}

	validateState(state: string): void {
		if (!this.states.includes(state)) throw DiscordApiErrors.INVALID_OAUTH_STATE;
	}

	isEnabled(): boolean {
		console.log(this.clientId, this.clientSecret, this.enabled);
		return !!(this.clientId && this.clientSecret && this.enabled);
	}

	abstract makeAuthorizeUrl(): string;

	abstract makeTokenUrl(code: string): string;

	abstract exchangeCode(code: string, state: string): Promise<string>;

	abstract getUser(token: string): Promise<unknown>;

	abstract createConnection(userId: string, token: string, friend_sync: boolean, userInfo: unknown): ConnectedAccount;
}
