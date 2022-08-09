import { Config, ConnectedAccount, DiscordApiErrors } from "@fosscord/util";
import fetch from "node-fetch";
import { BaseConnection, OAuthTokenResponse } from "./BaseConnection";

// TODO: do we really need all this when we only use name?
export interface GitHubConnectionUser {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
	name: string;
	company: string;
	blog: string;
	location: string;
	email: string;
	hireable?: any;
	bio: string;
	twitter_username: string;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: Date;
	updated_at: Date;
	private_gists: number;
	total_private_repos: number;
	owned_private_repos: number;
	disk_usage: number;
	collaborators: number;
	two_factor_authentication: boolean;
	plan: {
		name: string;
		space: number;
		collaborators: number;
		private_repos: number;
	};
}

export class GitHubConnection extends BaseConnection {
	constructor() {
		super({
			name: "github",
			authorizeUrl: "https://github.com/login/oauth/authorize",
			tokenUrl: "https://github.com/login/oauth/access_token",
			userInfoUrl: "https://api.github.com/user",
			scopes: ["read:user"]
		});
	}

	makeAuthorizeUrl(): string {
		const state = this.createState();

		const url = new URL(this.options.authorizeUrl);

		url.searchParams.append("client_id", this.clientId!);
		// TODO: probably shouldn't rely on cdn as this could be different from what we actually want. we should have an api endpoint setting.
		url.searchParams.append("redirect_uri", `${Config.get().cdn.endpointPrivate}/connections/${this.options.name}/callback`);
		url.searchParams.append("scope", this.options.scopes.join(" "));
		url.searchParams.append("state", state);
		return url.toString();
	}

	makeTokenUrl(code: string): string {
		const url = new URL(this.options.tokenUrl);
		url.searchParams.append("client_id", this.clientId);
		url.searchParams.append("client_secret", this.clientSecret);
		url.searchParams.append("code", code);

		return url.toString();
	}

	async exchangeCode(code: string, state: string): Promise<string> {
		this.validateState(state);

		const url = this.makeTokenUrl(code);

		return fetch(url.toString(), {
			method: "POST",
			headers: {
				Accept: "application/json"
			}
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse) => res.access_token)
			.catch((e) => {
				console.error(`Error exchanging token for GitHub connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<GitHubConnectionUser> {
		const url = new URL(this.options.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then((res) => res.json());
	}

	createConnection(userId: string, token: string, friend_sync: boolean, userInfo: GitHubConnectionUser): ConnectedAccount {
		return new ConnectedAccount({
			user_id: userId,
			id: userInfo.id,
			access_token: token,
			friend_sync: friend_sync,
			name: userInfo.name,
			revoked: false,
			show_activity: false,
			type: this.options.name,
			verified: true,
			visibility: 0,
			integrations: []
		});
	}
}
