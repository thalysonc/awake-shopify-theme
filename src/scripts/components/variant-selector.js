/**
 * Variant selector component
 * 
 * @module variant-selector
 * @version 1.0.0
 * @extends HTMLElement
 */

customElements.component = 'variant-selector';

if(!customElements.get(customElements.component)) {

    class variantSelector extends HTMLElement {

        /**
         * Variant selector web component
         * 
         * @constructor
         */
        constructor() {

            super();

            window.theme.product.loadProduct(this.dataset.handle).then(product => {

                this.product = product;
                this.render(product);
            });
        }
        
        /**
         * Init component events
         * 
         * @param {object} product Product data.
         * @returns {undefined}
         */
        initEvents(product) {

            let select = this.querySelector('select');

            if (select) {

                // Trigger event on it to select the first variant available
                this.triggerVariantChange(select.value, product);

                select.addEventListener('change', event => {
                    this.triggerVariantChange(event.target.value, product);
                });
            }
        }

        /**
         * Render component in the DOM
         * 
         * @param {object} product Product data.
         * @returns {undefined}
         */
        render(product) {
            
            if (this.getTemplate()) {

                let html = this.getTemplate();

                // Load options

                let options = '';

                // TODO: We need to improve this code to remove or hide the dependency of the swatch terms.
                product.variants.forEach(variant => {

                    let reference = '';

                    product.options.forEach((option, index) => {

                        // We are using this data to handle out of stock swatches
                        reference = reference + ` data-swatches-option-${option.name.replace(/ /g, '-')}="${variant.options[index].replace(/ /g, '-')}"`;
                    });
                    
                    if (variant.available) {

                        options = options + `<option data-variant-id="${variant.id}" ${reference} value="${variant.id}" data-enabled>${variant.title}</option>`;
                    
                    } else {

                        options = options + `<option data-variant-id="${variant.id}" ${reference} value="${variant.id}" data-disabled>${variant.title} - Sold Out</option>`;
                    }
                });

                html = html.replace(/{{options}}/g, options);

                // Inject HTML
                this.innerHTML = html;

                this.initEvents(product);
                this.triggerRender(product);
            }
        }

        /**
         * Get component template
         * 
         * @returns {string} Component HTML template.
         */
        getTemplate() {

            return `<select name="id">{{options}}</select>`;
        }

        /**
         * Trigger render
         * 
         * @param {object} product Product data.
         * @returns {object} Event Trigger ready.
         */
        triggerRender(product) {

            this.dataset.ready =  true;

            let event = new CustomEvent('ready', {'detail': {
                product: product
            }});
    
            this.dispatchEvent(event);
    
            return event;
        }

        /**
         * Trigger variant change with data
         * 
         * @public
         * @method
         * @name triggerVariantChange
         * @param {integer} variantId Variant id.
         * @param {object} product Product data.
         * @fires variant-change
         * @returns {object} Event variant-change.
         */
        triggerVariantChange(variantId, product) {

            let event = new CustomEvent('variant-change', {'detail': {
                variantId: variantId,
                variant: window.theme.product.getVariant(variantId, product),
                product: product
            }});

            this.dispatchEvent(event);
            window.dispatchEvent(event);

            return event;
        }

        /**
         * Is component ready.
         * 
         * @returns {boolean}
         */
        isReady() {

            return (this.dataset.ready) ? true : false;
        }
        
        /**
         * Update variant selector value by variant id.
         * 
         * @param {int} variantId Variant Id.
         * @returns {undefined}
         */
        update(variantId) {

            let select = this.querySelector('select');

            if (select) {
                select.value = variantId;
                this.triggerVariantChange(variantId, this.product);
            }
        }
        
        /**
         * Get variant object.
         * 
         * @returns {object} variant Variant data.
         */
        getVariant() {

            let select = this.querySelector('select');

            return (select) ? window.theme.product.getVariant(select.value, this.product) : null;
        }
        
        /**
         * Disable component.
         * 
         * @returns {undefined}
         */
        disable() {
            
            let select = this.querySelector('select');

            if (select) {
                select.classList.add('disabled');
            }
        }
        
        /**
         * Enable component.
         * 
         * @returns {undefined}
         */
        enable() {

            let select = this.querySelector('select');

            if (select) {
                select.classList.remove('disabled');
            }
        }
    }

    customElements.define(customElements.component, variantSelector);
}