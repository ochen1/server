import { Router, Request, Response } from "express";
import {
	User,
	generateToken,
	generateMfaBackupCodes,
	TotpEnableSchema,
	UserAuth,
} from "@fosscord/util";
import { route } from "@fosscord/api";
import bcrypt from "bcrypt";
import { HTTPError } from "lambert-server";
import { verifyToken } from "node-2fa";

const router = Router();

router.post(
	"/",
	route({ body: "TotpEnableSchema" }),
	async (req: Request, res: Response) => {
		const body = req.body as TotpEnableSchema;

		const auth = await UserAuth.findOneOrFail({ where: { user: { id: req.user_id } } });

		// TODO: Are guests allowed to enable 2fa?
		if (auth.password) {
			if (!(await bcrypt.compare(body.password, auth.password || ""))) {
				throw new HTTPError(req.t("auth:login.INVALID_PASSWORD"));
			}
		}

		if (!body.secret)
			throw new HTTPError(req.t("auth:login.INVALID_TOTP_SECRET"), 60005);

		if (!body.code)
			throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

		if (verifyToken(body.secret, body.code)?.delta != 0)
			throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

		let backup_codes = generateMfaBackupCodes(req.user_id);
		await Promise.all([
			...backup_codes.map((x) => x.save()),
			User.update({ id: req.user_id }, { mfa_enabled: true }),
			UserAuth.update({ index: auth.index }, { totp_secret: body.secret })
		]);

		res.send({
			token: await generateToken(auth.user.id),
			backup_codes: backup_codes.map((x) => ({
				...x,
				expired: undefined,
			})),
		});
	},
);

export default router;
