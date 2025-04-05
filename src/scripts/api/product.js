/**
 * Product API component
 *
 * @module product
 */
const component = {

    /**
     * Initialize the product component
     * 
     * @returns {void}
     */
    init: () => {

        /**
         * Product module api
         * 
         * @global
         */
        window.theme.product = component;
    },

    /**
     * Get a product by handle
     * 
     * @param {string} handle
     * @returns {Promise<Object>}
     */
    getProduct: (handle) => {
        return fetch(`/products/${handle}.json`)
            .then(response => response.json())
            .then(data => {
                return data;
            });
    }
};

export default component;