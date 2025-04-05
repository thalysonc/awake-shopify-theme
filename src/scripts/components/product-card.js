/**
 * Product Card Component
 * 
 * @module product-card
 * @version 1.0.0
 * @extends HTMLElement
 */

import { BaseComponent } from './base-component.js';

customElements.component = 'product-card';

if (!customElements.get(customElements.component)) {

    class ProductCard extends BaseComponent {

        /**
         * Product card web component
         * 
         * @constructor 
         */
        constructor() {
            super();

            theme.product.getProduct(this.dataset.handle).then(product => {

                this.render({
                    image: product.product.image.src,
                    title: product.product.title,
                    vendor: product.product.vendor
                });

                this.initEvents();
            });
        }

        initEvents() {

            let addToCartButton = this.querySelector('[data-add-to-cart]');

            if (addToCartButton) {
                addToCartButton.addEventListener('click', () => {
                    alert('product added to cart');
                });
            }
        }
    }

    customElements.define(customElements.component, ProductCard);
}
