/**
 * @fileoverview Variant selector web component for e-commerce product variants
 * This component provides a user-friendly interface for selecting product variants
 * with built-in support for:
 * - Loading states
 * - Error handling
 * - Accessibility
 * - Event handling
 * 
 * @example Basic Usage:
 * ```html
 * <variant-selector data-handle="my-product-handle"></variant-selector>
 * ```
 * 
 * @example With Event Handling:
 * ```javascript
 * const selector = document.querySelector('variant-selector');
 * 
 * // Listen for variant changes
 * selector.addEventListener('variant-change', (event) => {
 *     const { variantId, variant, product, handle, reference } = event.detail;
 *     console.log('Selected variant:', variant);
 * });
 * 
 * // Listen for component ready state
 * selector.addEventListener('ready', (event) => {
 *     const { product } = event.detail;
 *     console.log('Component ready with product:', product);
 * });
 * ```
 * 
 * @example Programmatic Control:
 * ```javascript
 * const selector = document.querySelector('variant-selector');
 * 
 * // Update selected variant
 * selector.update('variant-id-123');
 * 
 * // Get current variant
 * const currentVariant = selector.getVariant();
 * 
 * // Disable/Enable selector
 * selector.disable();
 * selector.enable();
 * ```
 * 
 * @typedef {Object} Product
 * @property {string} id - Product ID
 * @property {string} handle - Product handle
 * @property {Array<Variant>} variants - Product variants
 * @property {Array<Option>} options - Product options
 * 
 * @typedef {Object} Variant
 * @property {string} id - Variant ID
 * @property {string} title - Variant title
 * @property {boolean} available - Whether the variant is available
 * @property {Array<string>} options - Variant option values
 * 
 * @typedef {Object} Option
 * @property {string} name - Option name
 * @property {Array<string>} values - Option values
 * 
 * @module variant-selector
 * @version 2.0.0
 */

// Define component name in a more maintainable way
const COMPONENT_NAME = 'variant-selector';

if (!customElements.get(COMPONENT_NAME)) {
    /**
     * VariantSelector class
     * @class
     * @extends HTMLElement
     * 
     * @property {Product|null} product - The loaded product data
     * @property {boolean} isLoading - Loading state flag
     * @property {string} errorMessage - Error message if any
     * 
     * @fires VariantSelector#variant-change
     * @fires VariantSelector#ready
     */
    class VariantSelector extends HTMLElement {

        /** @type {Product|null} */
        product;

        /**
         * Constructor
         * Initializes the component
         */
        constructor() {
            super();

            if (!this.dataset.handle) {
                throw new Error('Product handle is required');
            }

            this.classList.add('hidden');
            this.classList.add('variant-selector');
        }

        /**
         * Lifecycle callback when component is mounted
         * Initiates product loading
         */
        connectedCallback() {

            window.theme.product.loadProduct(this.dataset.handle).then(product => {

                this.product = product;
                this.render();
            });
        }

        /**
         * Initializes component event listeners
         * Sets up variant change handling
         * @private
         */
        initEvents() {

            const select = this.querySelector('select');

            if (select) {

                // Set initial variant
                this.triggerVariantChange(select.value, 'init');

                // Handle select change
                select.addEventListener('change', (event) => {
                    this.triggerVariantChange(event.target.value, 'input');
                });
            }
        }

        /**
         * Generates component HTML template
         * Handles loading, error, and normal states
         * @private
         * @returns {string} Component HTML
         */
        getTemplate() {

            if (!this.product?.variants?.length) {
                return `<div class="error" role="alert">No variants available</div>`;
            }

            const options = this.product.variants.map(variant => {
                const isAvailable = variant.available;
                const title = isAvailable ? variant.title : `${variant.title} - Sold Out`;
                const disabled = !isAvailable ? 'disabled' : '';
                const reference = this.getVariantOptionReferenceHtml(variant);
                return `<option data-variant-id="${variant.id}" value="${variant.id}" ${reference} ${disabled}>${title} - ${variant.id}</option>`;

            }).join('');

            return `<select name="id" aria-label="Product variants">${options}</select>`;
        }

        /**
         * Generates HTML for variant option references
         * 
         * @param {Variant} variant - The variant object
         * @returns {string} HTML for variant option references
         */
        getVariantOptionReferenceHtml(variant) {

            return this.product.options
                .map((option, index) => {
                    const optionName = option.name.replace(/ /g, '-');
                    const optionValue = variant.options[index].replace(/ /g, '-');
                    return `data-option-${optionName}="${optionValue}"`;
                })
                .join(' ');
        }

        /**
         * Renders the component in the DOM
         * @private
         */
        render() {

            this.innerHTML = this.getTemplate();

            this.initEvents();

            this.triggerRender();
        }

        /**
         * Triggers the ready event
         * Indicates component has finished initialization
         * @private
         * @fires VariantSelector#ready
         */
        triggerRender() {
            this.dataset.ready = 'true';
            const event = new CustomEvent('ready', {
                detail: {
                    product: this.product
                }
            });
            this.dispatchEvent(event);
        }

        /**
         * Triggers variant change event
         * @param {string} variantId - Selected variant ID
         * @param {string} reference - Reference for the change trigger ('init', 'change', 'update', or 'default')
         * @fires VariantSelector#variant-change
         */
        triggerVariantChange(variantId, reference = 'default') {
            if (!this.product) return;

            const variant = window.theme.product.getVariant(variantId, this.product);
            const event = new CustomEvent('variant-change', {
                detail: {
                    variantId,
                    variant,
                    product: this.product,
                    handle: this.dataset.handle,
                    reference
                },
                bubbles: true
            });

            this.dispatchEvent(event);
            window.dispatchEvent(event);
        }

        /**
         * Checks if component is ready
         * @returns {boolean} Ready state
         */
        isReady() {
            return this.dataset.ready === 'true';
        }

        /**
         * Updates selected variant
         * @param {string} variantId - Variant ID to select
         * @public
         */
        update(variantId) {
            const select = this.querySelector('select');
            if (select && this.product) {
                select.value = variantId;
                this.triggerVariantChange(variantId, 'update');
            }
        }

        /**
         * Gets current variant
         * @returns {Variant|null} Current variant or null if none selected
         * @public
         */
        getVariant() {
            const select = this.querySelector('select');
            return select && this.product 
                ? window.theme.product.getVariant(select.value, this.product) 
                : null;
        }

        /**
         * Disables the selector
         * @public
         */
        disable() {
            const select = this.querySelector('select');
            if (select) {
                this.classList.add('disabled');
                select.disabled = true;
            }
        }

        /**
         * Enables the selector
         * @public
         */
        enable() {
            const select = this.querySelector('select');
            if (select) {
                this.classList.remove('disabled');
                select.disabled = false;
            }
        }
    }

    // Register the custom element
    customElements.define(COMPONENT_NAME, VariantSelector);
}