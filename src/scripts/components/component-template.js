/**
 * Component template
 * 
 * Extends HTMLTemplateElement to create a custom element that can be used as a template for other components.
 * 
 * @module component
 * @version 1.0.0
 * @extends HTMLTemplateElement
 */

customElements.component = 'component-template';

if(!customElements.get(customElements.component)) {

    class Component extends HTMLTemplateElement {

        /**
         * Web component constructor
         * 
         * @constructor
         */
        constructor() {
            super();
        }

        /**
         * Called when the element is connected to the DOM
         */
        connectedCallback() {
            // The template content won't be rendered by default
            // as it inherits this behavior from HTMLTemplateElement
        }

        /**
         * Get the template content
         * 
         * @returns {DocumentFragment} The template content
         */
        getContent() {
            return this.content.cloneNode(true);
        }

        /**
         * Get the HTML content of the template
         * 
         * @param {Object} variables The variables to replace in the template
         * @returns {string} The HTML content of the template
         */
        getHTML(variables = {}) {
            
            const content = this.getContent();
            const firstElement = content.firstElementChild;

            // Replace variables in the template
            Object.keys(variables).forEach(key => {
                const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                firstElement.innerHTML = firstElement.innerHTML.replace(regex, variables[key]);
            });

            return firstElement.outerHTML;
        }
    }

    // Note: When extending built-in elements, we need to pass options to define
    customElements.define(customElements.component, Component, { extends: 'template' });

    // Add a helper function to get a template by type
    window.theme.getTemplate = function(type) {
        return document.querySelector(`template[is="component-template"][data-type="${type}"]`);
    }
} 