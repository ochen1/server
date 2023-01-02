import { FieldErrors, User, UserAuth } from "@fosscord/util";
import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import bcrypt from "bcrypt";

const router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	const auth = await UserAuth.findOneOrFail({
		where: { user: { id: req.user_id } }
	});

	if (auth.password) {
		if (!await bcrypt.compare(req.body.password, auth.password)) {
			throw FieldErrors({
				password: {
					message: req.t("auth:login.INVALID_PASSWORD"),
					code: "INVALID_PASSWORD",
				},
			});
		}
	}

	await Promise.all([
		User.update({ id: req.user_id }, { disabled: true }),
	]);

	return res.status(204);
});

export default router;
