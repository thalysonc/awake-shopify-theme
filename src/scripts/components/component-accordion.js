/**
 * Component Accordion
 * 
 * @module component-accordion
 * @version 1.0.1
 * @extends HTMLElement
 */

customElements.component = 'component-accordion';

if (!customElements.get(customElements.component)) {
 
    class componentAccordion extends HTMLElement {
        
        /**
         * Accordion web component.
         * 
         * @constructor
         */
        constructor() {
            super();

            this.trigger = this.querySelector('[data-accordion-trigger]');
            this.container = this.querySelector('[data-accordion-container]');
            this.isOpen = false;
            this.transitionDuration = 300; // ms
            this.isDisabled = false; // New property to track disabled state

            // Bind methods to preserve context
            this.handleClick = this.handleClick.bind(this);
            this.handleKeydown = this.handleKeydown.bind(this);

            this.initEvents();

            if (this.dataset.defaultOpen === 'true') {
                requestAnimationFrame(() => {
                    this.trigger?.click();
                });
            }
        }

        /**
         * Called when the element is connected to the DOM
         */
        connectedCallback() {
            // Add transition styles
            if (this.container) {
                this.container.style.transition = `max-height ${this.transitionDuration}ms ease-in-out`;
            }
        }

        /**
         * Called when the element is disconnected from the DOM
         */
        disconnectedCallback() {
            this.cleanup();
        }

        /**
         * Disable accordion functionality
         */
        disable() {
            if (this.isDisabled) return;
            
            this.isDisabled = true;
            this.setAttribute('data-disabled', 'true');
            
            if (this.trigger) {
                this.trigger.style.pointerEvents = 'none';
                this.trigger.setAttribute('tabindex', '-1');
            }

            if (this.container) {
                this.container.classList.remove('hidden');
                this.container.classList.add('active');
                this.container.style.maxHeight = 'none';
                this.trigger?.classList.add('active');
            }

            this.open();
        }

        /**
         * Enable accordion functionality
         */
        enable() {
            if (!this.isDisabled) return;
            
            this.isDisabled = false;
            this.removeAttribute('data-disabled');
            
            if (this.trigger) {
                this.trigger.style.pointerEvents = '';
                this.trigger.setAttribute('tabindex', '0');
            }

            this.close();
        }

        /**
         * Init component events.
         * 
         * @returns {boolean}
         */
        initEvents() {
            if (!this.container || !this.trigger) {
                console.warn('Accordion: Missing required elements');
                return false;
            }
        
            this.loadAttributes();

            // Add click handler
            this.trigger.addEventListener('click', this.handleClick);

            // Add keyboard handler
            this.trigger.addEventListener('keydown', this.handleKeydown);

            return true;
        }

        /**
         * Handle keyboard events
         * @param {KeyboardEvent} event 
         */
        handleKeydown(event) {
            switch (event.key) {
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    this.trigger.click();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.focusNextAccordion();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.focusPreviousAccordion();
                    break;
            }
        }

        /**
         * Handle click events
         * @param {Event} event 
         */
        handleClick(event) {
            event.preventDefault();
            
            if (this.isDisabled) return;

            this.toggle().then((newContentHeight) => {
                this.applyMaxHeightOnParent(newContentHeight);
            }).catch(error => {
                console.error('Error toggling accordion:', error);
            });
        }

        /**
         * Focus the next accordion trigger in the document
         */
        focusNextAccordion() {
            const accordions = Array.from(document.querySelectorAll(customElements.component));
            const currentIndex = accordions.indexOf(this);
            const nextAccordion = accordions[currentIndex + 1];
            nextAccordion?.querySelector('[data-accordion-trigger]')?.focus();
        }

        /**
         * Focus the previous accordion trigger in the document
         */
        focusPreviousAccordion() {
            const accordions = Array.from(document.querySelectorAll(customElements.component));
            const currentIndex = accordions.indexOf(this);
            const prevAccordion = accordions[currentIndex - 1];
            prevAccordion?.querySelector('[data-accordion-trigger]')?.focus();
        }

        /**
         * Change the parent max-height
         * @param {number} newContentHeight A data-accordion-container height
         */
        applyMaxHeightOnParent(newContentHeight) {
            if (!this.container) return;

            if (this.isOpen) {
                this.container.style.maxHeight = `${this.container.scrollHeight + newContentHeight}px`;
            } else {
                this.container.style.maxHeight = "0px";
            }
        }
 
        /**
         * Load accordion attributes
         */
        loadAttributes() {
            this.close();

            const id = `accordion_${Math.random().toString(36).substr(2, 9)}`;

            if (this.trigger) {
                this.trigger.setAttribute('aria-controls', `${id}_content`);
                this.trigger.setAttribute('aria-expanded', 'false');
                this.trigger.setAttribute('role', 'button');
                this.trigger.setAttribute('tabindex', '0');
                this.trigger.id = `${id}_trigger`;
            }

            if (this.container) {
                this.container.setAttribute('role', 'region');
                this.container.setAttribute('aria-labelledby', `${id}_trigger`);
                this.container.id = `${id}_content`;
            }
        }
 
        /**
         * Init Accordion toggle
         * 
         * @returns {Promise<number>} Promise object represents the container height
         */
        toggle() {
            return new Promise((resolve, reject) => {
                if (!this.container) {
                    reject(new Error('Container element not found'));
                    return;
                }

                try {
                    if (this.isOpen) {
                        this.close();
                    } else {
                        this.open();
                    }
                    resolve(this.container.scrollHeight);
                } catch (error) {
                    reject(error);
                }
            });
        }
 
        /**
         * Close accordion
         */
        close() {
            if (!this.trigger || !this.container) return;

            this.classList.remove('active');
            this.trigger.classList.remove('active');
            this.trigger.setAttribute('aria-expanded', 'false');
            this.container.classList.remove('active');
            this.isOpen = false;

            setTimeout(() => {
                if (this.container && !this.isDisabled) {
                    this.container.classList.add('hidden');
                }
            }, this.transitionDuration);
        }
 
        /**
         * Open accordion
         */
        open() {
            if (!this.trigger || !this.container) return;

            this.classList.add('active');
            this.trigger.classList.add('active');
            this.trigger.setAttribute('aria-expanded', 'true');
            this.container.classList.add('active');
            this.container.classList.remove('hidden');
            this.isOpen = true;
        }

        /**
         * Clean up event listeners
         */
        cleanup() {
            this.trigger?.removeEventListener('click', this.handleClick);
            this.trigger?.removeEventListener('keydown', this.handleKeydown);
        }
    }
 
    customElements.define('component-accordion', componentAccordion);
}