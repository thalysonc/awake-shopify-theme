/**
 * Product card component
 * 
 * @module variant-picker
 * @version 1.0.0
 * @extends BaseComponent
 */

import { BaseComponent } from './base-component.js';
import { URLHandler } from '../utils/url-handler.js';

customElements.component = 'variant-picker';

if(!customElements.get(customElements.component)) {

    class VariantPicker extends BaseComponent {

        /**
         * Web component constructor
         * 
         * @constructor
         */
        constructor() {
            super();

            if (!this.dataset.handle) {
                console.error('Product handle is required for variant-picker');
                return;
            }
        }

        /**
         * Connected callback
         * 
         * @returns {undefined}
         */
        connectedCallback() {
            window.theme.product.loadProduct(this.dataset.handle).then(product => {
                this.product = product;
                this.render();
                this.initEvents();
                this.initializeFromUrl();
            }); 
        }

        /**
         * Initialize picker from URL if variant ID is present
         * @private
         */
        initializeFromUrl() {
            const variantId = URLHandler.getVariantIdFromUrl();
            if (variantId) {
                const variant = this.product.variants.find(v => v.id.toString() === variantId.toString());
                if (variant) {
                    // Update the variant selector first
                    this.updateVariantSelector(variant.id);
                    
                    // Then update the picker options
                    this.querySelectorAll('select').forEach(select => {
                        const optionIndex = parseInt(select.dataset.index) - 1;
                        if (variant.options[optionIndex]) {
                            select.value = variant.options[optionIndex];
                        }
                    });
                }
            }
        }

        /**
         * Render the variant picker
         */
        render() {
            let html = '';

            if ((this.product.options.length > 1)||(this.product.options.length == 1 && this.product.options[0].values.length > 1)) {
                this.product.options.forEach((option, index) => {
                    index++;
                    html = html + `<div>
                        <label for="${option.name}" class="normal-case text-base tracking-normal">${option.name}</label>
                        <select id="${option.name}" name="${option.name}" data-index="${index}" aria-label="${option.name}">
                            ${option.values.map(value => `<option value="${value}">${value}</option>`).join('')}
                        </select>
                    </div>`;
                });

                this.innerHTML = html;
            } 
        }
        
        /**
         * Init component events
         * 
         * @returns {undefined}
         */
        initEvents() {
            this.addEventListener('change', () => {
                const variant = this.getSelectedVariant();
                if (variant) {
                    this.updateVariantSelector(variant.id);
                    URLHandler.updateUrlWithVariantId(variant.id);
                }
            });
        }

        /**
         * Get the selected variant
         * 
         * @returns {Variant} The selected variant
         */
        getSelectedVariant() {
            // Create object with selected options 
            let selectedOptions = {};

            // Save the selected options in to the object
            this.querySelectorAll('select').forEach(select => {
                const optionIndex = select.dataset.index;
                selectedOptions['option' + optionIndex] = select.value;
            });

            // Find a product variant based on the selected options
            const variant = this.product.variants.find((item) => {
                return ((item.option1 == selectedOptions.option1) && 
                        (item.option2 == selectedOptions.option2) && 
                        (item.option3 == selectedOptions.option3));
            });

            return variant;
        }

        /**
         * Update the variant selector
         * 
         * @param {string} variantId - The variant ID
         */
        updateVariantSelector(variantId) {
            const selector = document.querySelector('variant-selector[data-handle="' + this.dataset.handle + '"]');
            if (selector) {
                selector.update(variantId);
            }
        }
    }

    customElements.define(customElements.component, VariantPicker);
}