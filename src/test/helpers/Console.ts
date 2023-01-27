export const suppressConsole = () => {
	console["info"] = () => {
		/* */
	};
	console["log"] = () => {
		/* */
	};
	console["warn"] = () => {
		/* */
	};
	console["error"] = () => {
		/* */
	};
};
