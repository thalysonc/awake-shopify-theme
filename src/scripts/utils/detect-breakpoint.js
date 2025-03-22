const detectBreakpoint = {
	/**
	 * Init module
	 */
	init: () => {
		detectBreakpoint.initBreakpoints();

		detectBreakpoint.detect(true);

		window.addEventListener("resize", (event) => {
			detectBreakpoint.detect();
		});
	},

	initBreakpoints: () => {
		window.breakpoints = window.breakpoints || {
			largemobile: 640,
			tablet: 768,
			laptop: 1024,
			desktop: 1280,
			wide: 1536,
		};
	},

	/**
	 * Detect current breakpoint
	 */
	detect: (updateDom) => {
		detectBreakpoint.updateMode(updateDom);

		if (detectBreakpoint.detectChange()) {
			detectBreakpoint.triggerEvent();
		}
	},

	/**
	 * Update screen mode
	 */
	updateMode: (updateDom = false) => {
		let windowWidth =
			document.documentElement.clientWidth ||
			window.innerWidth ||
			document.body.clientWidth;

		if (windowWidth < window.breakpoints.wide) {
			if (windowWidth < window.breakpoints.desktop) {
				if (windowWidth < window.breakpoints.laptop) {
					if (windowWidth < window.breakpoints.tablet) {
						if (windowWidth < window.breakpoints.largemobile) {
							window.screenMode = "mobile";
						} else {
							window.screenMode = "largemobile";
						}
					} else {
						window.screenMode = "tablet";
					}
				} else {
					window.screenMode = "laptop";
				}
			} else {
				window.screenMode = "desktop";
			}
		} else {
			window.screenMode = "wide";
		}

		if (updateDom) {
			document
				.querySelector("body")
				.setAttribute("data-screen-mode", window.screenMode);
		}
	},

	/**
	 * Get current screen mode
	 */
	getMode: () => {
		return window.screenMode;
	},

	/**
	 * Trigger breakpoint change event
	 */
	triggerEvent: () => {
		detectBreakpoint.updateMode(true);

		let event = new CustomEvent("screen-breakpoint", {
			detail: { mode: detectBreakpoint.getMode() },
		});

		window.dispatchEvent(event);
	},

	/**
	 * Detect breakpoint change
	 */
	detectChange: () => {
		let mode = detectBreakpoint.getMode(),
			swap = window.screenSwapMode;

		if (mode === undefined && swap === undefined) {
			return true;
		}

		if (mode === "mobile" && swap !== "mobile") {
			window.screenSwapMode = "mobile";
			return true;
		}

		if (mode === "largemobile" && swap !== "largemobile") {
			window.screenSwapMode = "largemobile";
			return true;
		}

		if (mode === "tablet" && swap !== "tablet") {
			window.screenSwapMode = "tablet";
			return true;
		}

		if (mode === "laptop" && swap !== "laptop") {
			window.screenSwapMode = "laptop";
			return true;
		}

		if (mode === "desktop" && swap !== "desktop") {
			window.screenSwapMode = "desktop";
			return true;
		}

		if (mode === "wide" && swap !== "wide") {
			window.screenSwapMode = "wide";
			return true;
		}

		return false;
	},
};

export default detectBreakpoint;