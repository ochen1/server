import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import { ConnectedAccount } from "@fosscord/util";
const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const connections = await ConnectedAccount.find({
		where: {
			user_id: req.user_id
		},
		select: ["id", "type", "name", "verified", "visibility", "show_activity", "revoked", "access_token", "friend_sync", "integrations"]
	});

	res.json(connections);
});

export default router;
