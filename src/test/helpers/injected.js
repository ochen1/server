/* eslint-env browser */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

(this.webpackChunkdiscord_app = this.webpackChunkdiscord_app || []).push([
	[[228974]],
	{
		632540: (module, exports, req) => {
			window.find = (filter, options = {}) => {
				const { cacheOnly = false } = options;
				for (let i in req.c) {
					// eslint-disable-next-line no-prototype-builtins
					if (req.c.hasOwnProperty(i)) {
						let m = req.c[i].exports;
						if (m && m.__esModule && m.default && filter(m.default))
							return m.default;
						if (m && filter(m)) return m;
					}
				}
				if (cacheOnly) {
					console.warn("Cannot find loaded module in cache");
					return null;
				}
				console.warn(
					"Cannot find loaded module in cache. Loading all modules may have unexpected side effects",
				);
				for (let i = 0; i < req.m.length; ++i) {
					let m = req(i);
					if (m && m.__esModule && m.default && filter(m.default))
						return m.default;
					if (m && filter(m)) return m;
				}
				console.warn("Cannot find module");
				return null;
			};
			window.findByUniqueProperties = (propNames, options) =>
				find(
					(module) =>
						propNames.every((prop) => module[prop] !== undefined),
					options,
				);
			window.findByDisplayName = (displayName, options) =>
				find((module) => module.displayName === displayName, options);
			window.req = req;
		},
	},
	(t) => t(632540),
]);
