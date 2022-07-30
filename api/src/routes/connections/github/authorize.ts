import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { HTTPError } from "lambert-server";
import { Connections } from "@fosscord/api";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	if (!Connections.github.options.enabled) throw new HTTPError("GitHub connection is not available", 400);

	res.json({
		url: Connections.github.getAuthorizeUrl()
	});
});

export default router;
