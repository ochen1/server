import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import { Application, OrmUtils, DiscordApiErrors, ApplicationModifySchema, User, UserAuth } from "@fosscord/util";
import { verifyToken } from "node-2fa";
import { HTTPError } from "lambert-server";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const app = await Application.findOneOrFail({ where: { id: req.params.id }, relations: ["owner", "bot"] });
	if (app.owner.id != req.user_id)
		throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

	return res.json(app);
});

router.patch("/", route({ body: "ApplicationModifySchema" }), async (req: Request, res: Response) => {
	const body = req.body as ApplicationModifySchema;

	const [app, ourAuth] = await Promise.all([
		Application.findOneOrFail({ where: { id: req.params.id }, relations: ["owner", "bot"] }),
		UserAuth.findOneOrFail({ where: { user: { id: req.user_id } } }),
	]);

	if (ourAuth.user.id != req.user_id)
		throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

	if (ourAuth.totp_secret && (!req.body.code || verifyToken(ourAuth.totp_secret, req.body.code)))
		throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

	if (app.bot) {
		app.bot.assign({ bio: body.description });
		await app.bot.save();
	}

	app.assign(body);

	await app.save();

	return res.json(app);
});

router.post("/delete", route({}), async (req: Request, res: Response) => {
	const app = await Application.findOneOrFail({ where: { id: req.params.id }, relations: ["bot", "owner"] });
	const ownerAuth = await UserAuth.findOneOrFail({ where: { user: { id: app.owner.id } } });
	if (app.owner.id != req.user_id)
		throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

	if (ownerAuth.totp_secret && (!req.body.code || verifyToken(ownerAuth.totp_secret, req.body.code)))
		throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

	if (app.bot)
		await User.delete({ id: app.bot.id });

	await Application.delete({ id: app.id });

	res.send().status(200);
});


export default router;