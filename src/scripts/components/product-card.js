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

            theme.product.loadProduct(this.dataset.handle).then(product => {
                this.render({
                    image: product.featured_image,
                    title: product.title,
                    vendor: product.vendor,
                    url: product.url,
                    firstVariantId: product.variants[0].id
                });

                this.initEvents();
            });
        }

        initEvents() {

            let addToCartButton = this.querySelector('[data-add-to-cart]');

            if (addToCartButton) {
                
                addToCartButton.addEventListener('click', () => {

                    const variantId = this.querySelector('[name="variant-id"]').value;

                    if (variantId) {

                        theme.cart.add(variantId, 1).then(data => {
                            alert('Product added to cart');
                        }).catch(error => {
                            alert('Error adding product to cart');
                        });
                    }
                });
            }
        }
    }

    customElements.define(customElements.component, ProductCard);
}