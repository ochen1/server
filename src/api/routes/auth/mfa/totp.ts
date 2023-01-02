import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { BackupCode, generateToken, User, TotpSchema, UserAuth } from "@fosscord/util";
import { verifyToken } from "node-2fa";
import { HTTPError } from "lambert-server";
const router = Router();

router.post(
	"/",
	route({ body: "TotpSchema" }),
	async (req: Request, res: Response) => {
		const { code, ticket, gift_code_sku_id, login_source } =
			req.body as TotpSchema;

		const auth = await UserAuth.findOneOrFail({
			where: { totp_last_ticket: ticket },
			relations: {
				user: {
					settings: true,
				}
			},
		});

		const backup = await BackupCode.findOne({
			where: {
				code: code,
				expired: false,
				consumed: false,
				user: { id: auth.user.id },
			},
		});

		if (!backup) {
			const ret = verifyToken(auth.totp_secret!, code);
			if (!ret || ret.delta != 0)
				throw new HTTPError(
					req.t("auth:login.INVALID_TOTP_CODE"),
					60008,
				);
		} else {
			backup.consumed = true;
			await backup.save();
		}

		await UserAuth.update({ index: auth.index }, { totp_last_ticket: undefined })

		return res.json({
			token: await generateToken(auth.user.id),
			user_settings: auth.user.settings,
		});
	},
);

export default router;
