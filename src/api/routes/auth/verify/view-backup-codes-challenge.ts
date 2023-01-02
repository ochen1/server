import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { FieldErrors, User, BackupCodesChallengeSchema, UserAuth } from "@fosscord/util";
import bcrypt from "bcrypt";
const router = Router();

router.post(
	"/",
	route({ body: "BackupCodesChallengeSchema" }),
	async (req: Request, res: Response) => {
		const { password } = req.body as BackupCodesChallengeSchema;

		const auth = await UserAuth.findOneOrFail({
			where: { user: { id: req.user_id }},
			select: { password: true }
		});

		if (!(await bcrypt.compare(password, auth.password || ""))) {
			throw FieldErrors({
				password: {
					message: req.t("auth:login.INVALID_PASSWORD"),
					code: "INVALID_PASSWORD",
				},
			});
		}

		return res.json({
			nonce: "NoncePlaceholder",
			regenerate_nonce: "RegenNoncePlaceholder",
		});
	},
);

export default router;
