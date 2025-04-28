/**
 * Product API component
 *
 * @module product
 */
const component = {

    // Cache configuration
    CACHE_CONFIG: {
        MAX_SIZE: 50000, // Maximum size in characters for cached items
        EXPIRY_TIME: 1800000, // 30 minutes in milliseconds
        PREFIX: 'product_cache_'
    },

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
        
        // Clean expired cache entries on init
        component.cleanExpiredCache();
    },

    /**
     * Load product object by handle
     * 
     * @public
     * @method
     * @name loadProduct
     * 
     * @param {string} handle - Product handle
     * @param {boolean} [force=false] - Force load from server, bypassing cache
     * @returns {Promise<Object>} Promise object represents a product
     * @throws {Error} When handle is not provided or invalid
     */
    loadProduct: (handle, force = false) => {
        
        if (!handle || typeof handle !== 'string') {
            return Promise.reject(new Error('Invalid product handle'));
        }
        
        return new Promise((resolve, reject) => {
            try {
                const cache = !force && component.getCache(handle);

                if (cache) {
                    resolve(cache);
                } else {
                    component.loadProductDataFromShopify(handle)
                        .then(product => {
                            const data = component.normalizeData(product);
                            component.cache(data.product);
                            resolve(data.product);
                        })
                        .catch(reject);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Load product data from Shopify
     * 
     * This function loads product data through the custom product JSON template
     * 
     * @private
     * @method
     * @name loadProductDataFromShopify
     * 
     * @param {string} handle - Product handle
     * @returns {Promise<Object>} Promise object represents a product
     * @throws {Error} When the API request fails
     */
    loadProductDataFromShopify: (handle) => {
        return new Promise((resolve, reject) => {
            const url = `/products/${handle}?view=json`;

            fetch(url)
                .then(resp => {
                    if (!resp.ok) {
                        throw new Error(`HTTP error! status: ${resp.status}`);
                    }
                    return resp.json();
                })
                .then(productData => {
                    if (!productData) {
                        throw new Error('No product data received');
                    }
                    resolve(productData);
                })
                .catch(error => {
                    reject(new Error(`Failed to load product data: ${error.message}`));
                });
        });
    },

    /**
     * Normalize product data
     * 
     * @private
     * @method
     * @name normalizeData
     * @param {object} data - Request data
     * @param {object} data.product - Product object
     * @param {array} [data.options_with_values] - Product options with values
     * @param {object} [data.options_by_name] - Product options indexed by name
     * @param {array} [data.product_metafields] - Product metafields
     * @returns {object} Normalized data
     * @throws {Error} When required product data is missing
     */
    normalizeData: data => {

        if (!data || !data.product) {
            throw new Error('Invalid product data structure');
        }

        const normalizedData = { product: { ...data.product } };

        // Fix options
        if (data.options_with_values) {
            normalizedData.product.options = data.options_with_values;
        }

        // Add options by name
        if (data.options_by_name) {
            normalizedData.product.options_by_name = data.options_by_name;
        }

        // Product metafields
        if (data.product_metafields) {
            normalizedData.product.metafields = data.product_metafields;
        }

        // Set product URL
        normalizedData.product.url = `${window.location.origin}/products/${normalizedData.product.handle}`;

        return normalizedData;
    },

    /**
     * Cache a product data
     * 
     * @private
     * @method
     * @name cache
     * @param {object} product - Product data
     * @returns {boolean} Whether caching was successful
     */
    cache: product => {

        if (!product?.handle) {
            return false;
        }

        const cacheKey = `${component.CACHE_CONFIG.PREFIX}${product.handle}`;
        const cacheData = {
            data: product,
            timestamp: Date.now()
        };

        try {
            const productValue = JSON.stringify(cacheData);
            
            if (productValue.length < component.CACHE_CONFIG.MAX_SIZE) {
                sessionStorage.setItem(cacheKey, productValue);
                return true;
            }
            
            return false;
        } catch (error) {
            console.warn('Failed to cache product:', error);
            return false;
        }
    },

    /**
     * Get product from cache
     * 
     * @private
     * @method
     * @name getCache
     * @param {string} handle - Product handle
     * @returns {object|null} Cached product data or null if not found/expired
     */
    getCache: handle => {
        try {
            const cacheKey = `${component.CACHE_CONFIG.PREFIX}${handle}`;
            const cachedValue = sessionStorage.getItem(cacheKey);
            
            if (!cachedValue) {
                return null;
            }

            const cacheData = JSON.parse(cachedValue);
            const now = Date.now();
            
            // Check if cache has expired
            if (now - cacheData.timestamp > component.CACHE_CONFIG.EXPIRY_TIME) {
                sessionStorage.removeItem(cacheKey);
                return null;
            }

            return cacheData.data;
        } catch (error) {
            console.warn('Failed to retrieve cache:', error);
            return null;
        }
    },

    /**
     * Clean expired cache entries
     * 
     * @private
     * @method
     * @name cleanExpiredCache
     */
    cleanExpiredCache: () => {
        try {
            const now = Date.now();
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith(component.CACHE_CONFIG.PREFIX)) {
                    try {
                        const cacheData = JSON.parse(sessionStorage.getItem(key));
                        if (now - cacheData.timestamp > component.CACHE_CONFIG.EXPIRY_TIME) {
                            sessionStorage.removeItem(key);
                        }
                    } catch (error) {
                        // Remove invalid cache entries
                        sessionStorage.removeItem(key);
                    }
                }
            });
        } catch (error) {
            console.warn('Failed to clean cache:', error);
        }
    },

    /**
     * Get variant data by ID from a product
     * 
     * @public
     * @method
     * @name getVariant
     * @param {number} variantId - The ID of the variant to find
     * @param {object} product - Product data containing variants array
     * @returns {object|null} The matching variant object or null if not found
     */
    getVariant: (variantId, product) => {
        
        if (!product?.variants?.length || !variantId) {
            return null;
        }

        return product.variants.find(variant => 
            variant.id === Number(variantId)
        ) || null;
    }
};

export default component;