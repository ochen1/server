import { Config, ConnectedAccount, DiscordApiErrors } from "@fosscord/util";
import fetch from "node-fetch";
import { BaseConnection, OAuthTokenResponse } from "./BaseConnection";

export interface TwitchConnectionUserResponse {
	data: {
		id: string;
		login: string;
		display_name: string;
		type: string;
		broadcaster_type: string;
		description: string;
		profile_image_url: string;
		offline_image_url: string;
		view_count: number;
		created_at: string;
	}[];
}

export class TwitchConnection extends BaseConnection {
	constructor() {
		super({
			name: "twitch",
			authorizeUrl: "https://id.twitch.tv/oauth2/authorize",
			tokenUrl: "https://id.twitch.tv/oauth2/token",
			userInfoUrl: "https://api.twitch.tv/helix/users",
			scopes: []
		});
	}

	makeAuthorizeUrl(): string {
		const state = this.createState();
		const url = new URL(this.options.authorizeUrl);

		url.searchParams.append("client_id", this.clientId!);
		// TODO: probably shouldn't rely on cdn as this could be different from what we actually want. we should have an api endpoint setting.
		url.searchParams.append("redirect_uri", `${Config.get().cdn.endpointPrivate}/connections/${this.options.name}/callback`);
		url.searchParams.append("response_type", "code");
		url.searchParams.append("scope", this.options.scopes.join(" "));
		url.searchParams.append("state", state);
		return url.toString();
	}

	makeTokenUrl(): string {
		return this.options.tokenUrl;
	}

	async exchangeCode(code: string, state: string): Promise<string> {
		this.validateState(state);

		const url = this.makeTokenUrl();

		return fetch(url.toString(), {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				client_id: this.clientId,
				client_secret: this.clientSecret,
				redirect_uri: `${Config.get().cdn.endpointPrivate}/connections/${this.options.name}/callback`
			})
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse) => res.access_token)
			.catch((e) => {
				console.error(`Error exchanging token for ${this.options.name} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<TwitchConnectionUserResponse> {
		const url = new URL(this.options.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Client-Id": this.clientId
			}
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(`[${res.status}] ${res.error}: ${res.message}`);
				return res;
			});
	}

	createConnection(userId: string, token: string, friend_sync: boolean, userInfo: TwitchConnectionUserResponse): ConnectedAccount {
		return new ConnectedAccount({
			user_id: userId,
			id: userInfo.data[0].id,
			access_token: token,
			friend_sync: friend_sync,
			name: userInfo.data[0].display_name,
			revoked: false,
			show_activity: false,
			type: this.options.name,
			verified: true,
			visibility: 0,
			integrations: []
		});
	}
}
