import jwt, { VerifyOptions } from "jsonwebtoken";
import { Config } from "./Config";
import { User, UserAuth } from "../entities";

export const JWTOptions: VerifyOptions = { algorithms: ["HS256"] };

export function checkToken(token: string, jwtSecret: string): Promise<any> {
	return new Promise((res, rej) => {
		token = token.replace("Bot ", "");
		token = token.replace("Bearer ", "");
		/**
		in fosscord, even with instances that have bot distinction; we won't enforce "Bot" prefix,
		as we don't really have separate pathways for bots 
		**/

		jwt.verify(token, jwtSecret, JWTOptions, async (err, decoded: any) => {
			if (err || !decoded) return rej("Invalid Token");

			const auth = await UserAuth.findOne({
				where: { user: { id: decoded.id } },
				select: { user: { 
					bot: true,
					disabled: true,
					deleted: true,
					rights: true,
				}}
			});

			if (!auth) return rej("Invalid Token");
			// we need to round it to seconds as it saved as seconds in jwt iat and valid_tokens_since is stored in milliseconds
			if (
				decoded.iat * 1000 <
				new Date(auth.valid_tokens_since).setSeconds(0, 0)
			)
				return rej("Invalid Token");
			if (auth.user.disabled) return rej("User disabled");
			if (auth.user.deleted) return rej("User not found");

			return res({ decoded, user: auth.user });
		});
	});
}

export async function generateToken(id: string) {
	const iat = Math.floor(Date.now() / 1000);
	const algorithm = "HS256";

	return new Promise((res, rej) => {
		jwt.sign(
			{ id: id, iat },
			Config.get().security.jwtSecret,
			{
				algorithm,
			},
			(err, token) => {
				if (err) return rej(err);
				return res(token);
			},
		);
	});
}
