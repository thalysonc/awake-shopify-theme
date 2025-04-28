/**
 * URL Handler
 * 
 * URL handling utility for managing variant IDs in the URL
 * 
 * @module url-handler
 * @version 1.0.0
 */

export const URLHandler = {
    /**
     * Get the variant ID from the URL
     * @returns {string|null} The variant ID or null if not present
     */
    getVariantIdFromUrl: () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('variant');
    },

    /**
     * Update the URL with a new variant ID
     * @param {string} variantId - The variant ID to set in the URL
     */
    updateUrlWithVariantId: (variantId) => {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variantId);
        window.history.replaceState({}, '', url);
    },

    /**
     * Remove the variant ID from the URL
     */
    removeVariantIdFromUrl: () => {
        const url = new URL(window.location.href);
        url.searchParams.delete('variant');
        window.history.replaceState({}, '', url);
    }
};