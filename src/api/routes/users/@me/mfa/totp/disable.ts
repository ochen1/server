import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { verifyToken } from "node-2fa";
import { HTTPError } from "lambert-server";
import {
	User,
	generateToken,
	BackupCode,
	TotpDisableSchema,
	UserAuth,
} from "@fosscord/util";

const router = Router();

router.post(
	"/",
	route({ body: "TotpDisableSchema" }),
	async (req: Request, res: Response) => {
		const body = req.body as TotpDisableSchema;

		const auth = await UserAuth.findOneOrFail({ where: { user: { id: req.user_id } } });

		const backup = await BackupCode.findOne({ where: { code: body.code } });
		if (!backup) {
			const ret = verifyToken(auth.totp_secret!, body.code);
			if (!ret || ret.delta != 0)
				throw new HTTPError(
					req.t("auth:login.INVALID_TOTP_CODE"),
					60008,
				);
		}

		await Promise.all([
			UserAuth.update({ index: auth.index }, {
				totp_secret: undefined,
			}),
			User.update({ id: req.user_id }, {
				mfa_enabled: false,
			}),
			BackupCode.update(
				{ user: { id: req.user_id } },
				{
					expired: true,
				},
			)
		]);

		return res.json({
			token: await generateToken(auth.user.id),
		});
	},
);

export default router;
