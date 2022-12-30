import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import { Application, OrmUtils, DiscordApiErrors, ApplicationModifySchema, User } from "@fosscord/util";
import { verifyToken } from "node-2fa";
import { HTTPError } from "lambert-server";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
    if(req.params.id == '@me') req.params.id = req.user_id;
	const app = await Application.findOneOrFail({ where: { id: req.params.id }, relations: ["owner", "bot"] });
	/*if (app.owner.id != req.user_id)
		throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;*/

	return res.json(app);
});


export default router;