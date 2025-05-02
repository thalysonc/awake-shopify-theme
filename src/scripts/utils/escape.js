const escape = {
	/**
	 * Init component
	 */
	init: () => {
		document.onkeydown = (event) => {
			event = event || window.event;
			let key = event.key || event.keyCode;
			if (key === "Escape" || key === "Esc" || key === 27) {
				let event = new CustomEvent("escape", { detail: {} });
				window.dispatchEvent(event);
			}
		};
	},
};

export default escape;