/**
 * Cart Module
 * 
 * This module provides a comprehensive interface for cart operations in a Shopify store.
 * It handles all cart-related functionality including fetching, adding, updating, and removing items.
 * All methods dispatch custom events that can be listened to for cart state changes.
 * 
 * Events dispatched:
 * - 'addtocart': When an item is added to cart
 * - 'update': When cart items are updated
 * - 'remove': When an item is removed from cart
 * 
 * @module cart
 */
const component = {
	/**
	 * Initialize the cart module
	 * Sets up the cart component in the global theme object
	 */
	init: () => {
		window.theme = window.theme || {};
		window.theme.cart = component;

		// Listen for cart events to invalidate cache
		['addtocart', 'update', 'remove'].forEach(eventName => {
			window.addEventListener(eventName, () => component._clearCache());
		});
	},

	/**
	 * Fetch current cart data from Shopify
	 * @returns {Promise<Object>} The cart data containing items, total price, and other cart information
	 * @throws {Error} If the request fails or returns an error status
	 * @example
	 * cart.get().then(cartData => {
	 *     console.log('Cart items:', cartData.items);
	 *     console.log('Total price:', cartData.total_price);
	 * });
	 */
	get: async () => {
		try {
			const response = await fetch('/cart.js', { 
				credentials: 'same-origin'
			});

			const data = await response.json();

			if (!response.ok) {
				const error = new Error(data.description || 'Failed to fetch cart');
				error.status = response.status;
				throw error;
			}

			return data;
		} catch (error) {
			console.error('Error fetching cart:', error);
			throw error;
		}
	},

	/**
	 * Add a product to the cart
	 * Dispatches 'addtocart' event on successful addition
	 * 
	 * @param {number|string} id - Shopify variant ID
	 * @param {number} [qty=1] - Quantity to add, defaults to 1
	 * @param {Object} [properties=null] - Additional line item properties
	 * @returns {Promise<Object>} The updated cart item data
	 * @throws {Error} If the request fails or returns an error status
	 * @example
	 * // Add 2 items with custom properties using variant ID
	 * cart.add(12345678, 2, { 'Gift': 'Yes' })
	 *     .then(data => console.log('Added to cart:', data))
	 *     .catch(error => console.error('Error:', error));
	 */
	add: async (id, qty = 1, properties = null) => {
		try {
			const body = {
				id,
				quantity: qty,
				...(properties && { properties })
			};

			const response = await fetch('/cart/add.js', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});

			const data = await response.json();

			if (!response.ok) {
				const error = new Error(data.description || 'Failed to add item to cart');
				error.status = response.status;
				throw error;
			}

			component.triggerEvent('addtocart', {
				cart: data,
				product_id: id,
				qty,
				properties
			});

			return data;
		} catch (error) {
			console.error('Error adding item to cart:', error);
			throw error;
		}
	},

	/**
	 * Remove a product from the cart
	 * This is implemented by setting its quantity to 0
	 * Dispatches 'remove' event on successful removal
	 * 
	 * @param {number|string} id - Shopify variant ID
	 * @returns {Promise<Object>} The updated cart data
	 * @throws {Error} If the request fails or returns an error status
	 * @example
	 * cart.remove(12345678)
	 *     .then(data => console.log('Item removed, updated cart:', data))
	 *     .catch(error => console.error('Error:', error));
	 */
	remove: async (id) => {
		try {
			const cart = await component.update(id, 0, null);
			
			component.triggerEvent('remove', { cart });
			
			return cart;
		} catch (error) {
			console.error('Error removing item from cart:', error);
			throw error;
		}
	},

	/**
	 * Update product quantity in cart
	 * Dispatches 'update' event on successful update
	 * 
	 * @param {number|string} id - Shopify variant ID
	 * @param {number} qty - New quantity (0 to remove item)
	 * @param {Object} [properties=null] - Updated line item properties
	 * @returns {Promise<Object>} The updated cart data
	 * @throws {Error} If the request fails or returns an error status
	 * @example
	 * // Update quantity to 3 using variant ID
	 * cart.update(12345678, 3)
	 *     .then(data => console.log('Updated cart:', data))
	 *     .catch(error => console.error('Error:', error));
	 */
	update: async (id, qty, properties = null) => {
		try {
			const body = {
				id,
				quantity: qty,
				...(properties && { properties })
			};

			const response = await fetch('/cart/change.js', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});

			const data = await response.json();

			if (!response.ok) {
				const error = new Error(data.description || 'Failed to update cart item');
				error.status = response.status;
				throw error;
			}

			component.triggerEvent('update', { cart: data });
			
			return data;
		} catch (error) {
			console.error('Error updating cart item:', error);
			throw error;
		}
	},

	/**
	 * Get specific item data from cart
	 * Uses caching to avoid unnecessary requests
	 * Cache is invalidated on cart updates or after maxAge (5 seconds)
	 * 
	 * @param {number|string} id - Shopify variant ID
	 * @returns {Promise<Object|null>} The cart item data or null if not found
	 * @throws {Error} If the request fails or returns an error status
	 * @example
	 * cart.getItem(12345678)
	 *     .then(item => {
	 *         if (item) {
	 *             console.log('Found item:', item);
	 *         } else {
	 *             console.log('Item not in cart');
	 *         }
	 *     });
	 */
	getItem: async (id) => {
		try {
			// Check cache first
			if (component._isCacheValid()) {
				return component._cache.items.find(item => item.id == id) || null;
			}

			// If cache is invalid or empty, fetch fresh data
			const cartData = await component.get();
			component._updateCache(cartData);
			
			if (!cartData.items?.length) {
				return null;
			}

			return cartData.items.find(item => item.id == id) || null;
			
		} catch (error) {
			console.error('Error fetching cart item:', error);
			throw error;
		}
	},

	/**
	 * Trigger a custom event for cart state changes
	 * Events bubble up through the DOM and are cancelable
	 * 
	 * @param {string} eventName - Name of the event to trigger ('addtocart', 'update', 'remove')
	 * @param {Object} data - Data to pass with the event
	 * @example
	 * // Listen for cart updates anywhere in the DOM
	 * document.addEventListener('addtocart', (event) => {
	 *     // Prevent adding more than 10 items
	 *     if (event.detail.qty > 10) {
	 *         event.preventDefault();
	 *         alert('Cannot add more than 10 items');
	 *     }
	 * });
	 */
	triggerEvent: (eventName, data) => {
		const event = new CustomEvent(eventName, {
			detail: data,
			bubbles: true,    // Event bubbles up through DOM
			cancelable: true  // Event can be canceled with preventDefault()
		});

		window.dispatchEvent(event);
	},

	// Private cache-related properties and methods
	_cache: {
		items: null,
		lastUpdated: null,
		maxAge: 5000, // Cache lifetime in milliseconds (5 seconds)
	},

	/**
	 * Clear the cart cache
	 * @private
	 */
	_clearCache: () => {
		component._cache.items = null;
		component._cache.lastUpdated = null;
	},

	/**
	 * Check if cache is valid
	 * @private
	 * @returns {boolean} True if cache is valid, false otherwise
	 */
	_isCacheValid: () => {
		return (
			component._cache.items !== null &&
			component._cache.lastUpdated !== null &&
			(Date.now() - component._cache.lastUpdated) < component._cache.maxAge
		);
	},

	/**
	 * Update the cache with new cart data
	 * @private
	 * @param {Object} cartData - The cart data to cache
	 */
	_updateCache: (cartData) => {
		component._cache.items = cartData.items || [];
		component._cache.lastUpdated = Date.now();
	},
};

export default component;