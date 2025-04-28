/**
 * Add to cart button component
 * 
 * @module component-addtocart
 * @version 1.0.0
 * @extends HTMLElement
 */

const COMPONENT_NAME = 'addtocart-button';
const BUTTON_TEXT = 'Add to Cart';
const SOLD_OUT_TEXT = 'Sold Out';
const LOADING_TEXT = 'Adding to cart...';

if (!customElements.get(COMPONENT_NAME)) {

    class AddToCartButton extends HTMLElement {

        /**
         * Add to cart button web component.
         * @constructor
         */
        constructor() {
            super();

            const productHandle = this.dataset.handle;
            
            if (!productHandle) {
                console.warn('AddToCartButton: Missing product handle', this);
                return;
            }

            this.loadProductData(productHandle);
        }

        /**
         * Load product data from the theme
         * @private
         * @param {string} handle - Product handle
         */
        async loadProductData(handle) {
            try {
                this.product = await window.theme.product.loadProduct(handle);
                this.ensureSubmitButton();
                this.render();
            } catch (error) {
                console.error('AddToCartButton: Failed to load product data', error);
            }
        }

        /**
         * Ensure submit button exists, create if not present
         * @private
         */
        ensureSubmitButton() {
            if (!this.getSubmitButton()) {
                const button = document.createElement('button');
                button.type = 'submit';
                button.innerHTML = BUTTON_TEXT;
                button.className = 'btn w-full';
                this.appendChild(button);
            }
        }

        /**
         * Get the submit button element
         * @returns {HTMLButtonElement|null}
         */
        getSubmitButton() {
            return this.querySelector('button[type="submit"]');
        }

        /**
         * Render component
         */
        render() {
            this.updateAvailability(this.product.available);
        }

        /**
         * Update component data by variant id
         * @param {number} variantId - Variant id
         */
        update(variantId) {
            const variant = window.theme.product.getVariant(variantId, this.product);
            
            if (variant) {
                this.updateAvailability(variant.available);
            }
        }

        /**
         * Disable the submit button
         */
        disable() {
            const button = this.getSubmitButton();
            if (button) {
                button.disabled = true;
                button.innerText = SOLD_OUT_TEXT;
                button.querySelector('[data-add-to-cart-icon]')?.classList?.add('hidden');
            }
        }

        /**
         * Enable the submit button
         */
        enable() {
            const button = this.getSubmitButton();
            if (button) {
                button.disabled = false;
                button.innerText = BUTTON_TEXT;
                button.querySelector('[data-add-to-cart-icon]')?.classList?.remove('hidden');
            }
        }

        /**
         * Set button to loading state
         */
        loading() {
            const button = this.getSubmitButton();
            if (button) {
                button.disabled = true;
                button.innerText = LOADING_TEXT;
            }
        }

        /**
         * Update component availability status
         * @param {boolean} isAvailable - Product availability status
         */
        updateAvailability(isAvailable) {
            isAvailable ? this.enable() : this.disable();
        }
    }

    customElements.define(COMPONENT_NAME, AddToCartButton);
}