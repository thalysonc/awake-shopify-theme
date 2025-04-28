/**
 * ProductForm Web Component
 * Handles the product form functionality including:
 * - Product data loading
 * - Variant selection
 * - Cart addition
 * - Form validation
 * - Error handling
 *
 * @element product-form
 * @attr {string} data-handle - The product handle to load
 * @fires variant-change - When a variant is changed
 * @fires ready - When the component is ready
 */
export class ProductForm extends HTMLElement {

	/**
	 * Initialize the component and set up instance properties
	 */
	constructor() {
		super();

		/** @type {HTMLFormElement} Form element reference */
		this.form = null;

		/** @type {Object} Product data */
		this.product = null;

		/** @type {HTMLElement} Variant selector component reference */
		this.variantSelector = null;

		/** @type {boolean} Flag to prevent double submission */
		this.isSubmitting = false;
	}

	/**
	 * Lifecycle callback when element is connected to DOM
	 * Initializes form and product data
	 */
	connectedCallback() {

		this.form = this.querySelector("form");

		if (!this.form) {
			console.warn("No form element found inside product-form component");
			return;
		}

		if (!this.dataset.handle) {
			console.error("Missing product handle", this);
			return;
		}

		this.initializeProduct();
	}

	/**
	 * Loads product data from the theme's product API
	 * @async
	 * @throws {Error} If product loading fails
	 */
	async initializeProduct() {
		try {
			this.product = await window.theme.product.loadProduct(this.dataset.handle);
			this.initEvents();
		} catch (error) {
			console.error("Error loading product:", error);
			this.displayErrorMessage(null, null, {
				message: "Error loading product. Please try again.",
			});
		}
	}

	/**
	 * Initializes event listeners for form and variant selector
	 */
	initEvents() {

		// Form submission handler
		this.form.addEventListener("submit", event => this.onFormSubmit(event));

		// Variant selector handling
		const variantSelector = this.getVariantSelector();

		if (variantSelector) {
			this.setupVariantSelectorEvents(variantSelector);
		}
	}

	/**
	 * Sets up event listeners for variant selector component
	 * @param {HTMLElement} variantSelector - The variant selector component
	 */
	setupVariantSelectorEvents(variantSelector) {

		variantSelector.addEventListener("ready", () => {
			this.updateFormState();
		});

		if (variantSelector.isReady()) {
			this.updateFormState();
		}

		variantSelector.addEventListener("variant-change", (event) => {
			this.updateFormState(event.detail);
		});
	}

	/**
	 * Updates form UI based on variant availability
	 * @param {Object} variantData - Data about the selected variant
	 * @param {boolean} variantData.available - Whether the variant is available
	 */
	updateFormState(variantData) {

        console.log('updateFormState', variantData);

		// Update form state based on variant data
		// This will be called when variants change or when the selector is ready
		if (!variantData) return;
        
        // TODO: Rewrite this code to handle other elements dynamically
        const price = document.querySelector('[data-price]');
        price.innerHTML = theme.money.format(variantData.variant.price);

        const sku = document.querySelector('[data-sku]');
        sku.innerHTML = 'SKU: ' + variantData.variant.sku;
	}

	/**
	 * Gets or creates reference to variant selector component
	 * @returns {HTMLElement|null} The variant selector component
	 */
	getVariantSelector() {
		if (!this.variantSelector) {
			this.variantSelector = this.querySelector(
				`variant-selector[data-handle="${this.dataset.handle}"]`,
			);
		}
		return this.variantSelector;
	}

	/**
	 * Validates form data before submission
	 * @param {FormData} formData - The form data to validate
	 * @returns {Object} Validated form data
	 * @throws {Error} If validation fails
	 */
	validateForm(formData) {
		const id = formData.get("id");
		const qty = formData.get("qty") || "1"; // Default to 1 if quantity not provided

		if (!id) {
			throw new Error("Please select a product variant");
		}

		const quantity = parseInt(qty, 10);
		if (isNaN(quantity) || quantity < 1) {
			throw new Error("Please enter a valid quantity");
		}

		return { id, quantity };
	}

	/**
	 * Extracts custom properties from form data
	 * @param {FormData} formData - The form data to process
	 * @returns {Object} Extracted properties
	 */
	getFormProperties(formData) {
		const properties = {};
		for (const [key, value] of formData) {
			const propertyMatch = key.match(/properties\[([^\]]*)\]/i);
			if (propertyMatch && value !== "") {
				properties[propertyMatch[1]] = value;
			}
		}
		return properties;
	}

	/**
	 * Handles form submission
	 * @async
	 * @param {Event} event - The submit event
	 */
	async onFormSubmit(event) {

		event.preventDefault();

		if (this.isSubmitting) return;

        // Get form elements
        const form = event.target;
        const variantId = form.querySelector('[name="id"]').value;
        const quantity = form.querySelector('input[name="quantity"]').value;
        const customName = form.querySelector('input[name="properties[Custom Name]"]').value;

        this.isSubmitting = true;

        let properties = {};

        if (customName) {
          properties['Custom Name'] = customName;
        }

        // Get add to cart component
        const addToCartBtn = this.querySelector('addtocart-button');

        // Set loading state
        addToCartBtn.loading();

        // Add to cart
        theme.cart.add(variantId, quantity, properties).then(data => {

            // Enable submit button
            addToCartBtn.enable();

            // TODO: Open mini cart

            this.isSubmitting = false;

        }).catch(error => {

            console.error(error);

            // Enable submit button
            addToCartBtn.enable();

            this.isSubmitting = false;
        });
	}

	/**
	 * Displays error messages to the user
	 * @param {string} id - The variant ID
	 * @param {string} qty - The quantity
	 * @param {Error} error - The error object
	 */
	displayErrorMessage(id, qty, error) {
		// Create or get error message container
		let errorContainer = this.form.querySelector(".form-error");
		if (!errorContainer) {
			errorContainer = document.createElement("div");
			errorContainer.className = "form-error text-red-500 text-sm mt-2";
			this.form.appendChild(errorContainer);
		}

		errorContainer.textContent = error.message;
		errorContainer.style.display = "block";

		// Hide error after 5 seconds
		setTimeout(() => {
			errorContainer.style.display = "none";
		}, 5000);
	}
}

customElements.define("product-form", ProductForm);
