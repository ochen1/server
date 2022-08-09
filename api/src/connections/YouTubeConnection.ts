import { Config, ConnectedAccount, DiscordApiErrors } from "@fosscord/util";
import fetch from "node-fetch";
import { BaseConnection, OAuthTokenResponse } from "./BaseConnection";

export interface YouTubeConnectionChannelListResult {
	items: {
		snippet: {
			// thumbnails: Thumbnails;
			title: string;
			country: string;
			publishedAt: string;
			// localized: Localized;
			description: string;
		};
		kind: string;
		etag: string;
		id: string;
	}[];
	kind: string;
	etag: string;
	pageInfo: {
		resultsPerPage: number;
		totalResults: number;
	};
}

export class YouTubeConnection extends BaseConnection {
	constructor() {
		super({
			name: "youtube",
			authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
			tokenUrl: "https://oauth2.googleapis.com/token",
			userInfoUrl: "https://www.googleapis.com/youtube/v3/channels?mine=true&part=snippet",
			scopes: ["https://www.googleapis.com/auth/youtube.readonly"]
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
			.then((res: OAuthTokenResponse) => {
				return res.access_token;
			})
			.catch((e) => {
				console.error(`Error exchanging token for ${this.options.name} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<YouTubeConnectionChannelListResult> {
		const url = new URL(this.options.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then((res) => res.json());
	}

	createConnection(
		userId: string,
		token: string,
		friend_sync: boolean,
		channelInfo: YouTubeConnectionChannelListResult
	): ConnectedAccount {
		return new ConnectedAccount({
			user_id: userId,
			id: channelInfo.items[0].id,
			access_token: token,
			friend_sync: friend_sync,
			name: channelInfo.items[0].snippet.title,
			revoked: false,
			show_activity: false,
			type: this.options.name,
			verified: true,
			visibility: 0,
			integrations: []
		});
	}
}
