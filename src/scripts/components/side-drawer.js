/**
 * Side drawer component
 * 
 * @module side-drawer
 * @version 1.0.0
 * @extends HTMLElement
 */

customElements.component = 'side-drawer';

if (!customElements.get(customElements.component)) {
  
    class SideDrawer extends HTMLElement {

        static get observedAttributes() {
            return ['side', 'width', 'animation-duration'];
        }

        /**
         * Web component constructor
         * 
         * @constructor
         */
        constructor() {
            super();
            
            this.style.display = 'none';
            this.classList.add('side-drawer');
            
            // Default configuration
            this.config = {
                side: 'left',
                width: '375px',
                animationDuration: 300,
                overlayOpacity: 0.3
            };

            // Callback functions
            this.afterOpen = null;
            this.beforeClose = null;

            // Store original scroll position
            this.scrollPosition = 0;

            this.render();
        }

        connectedCallback() {
            this.setAttribute('role', 'dialog');
            this.setAttribute('aria-modal', 'true');
            this.setAttribute('aria-hidden', 'true');
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue) return;

            switch (name) {
                case 'side':
                    this.config.side = newValue;
                    this.setAttribute('data-side', newValue);
                    break;
                case 'width':
                    this.config.width = newValue;
                    this.querySelector('[data-container]').style.width = newValue;
                    break;
                case 'animation-duration':
                    this.config.animationDuration = parseInt(newValue);
                    break;
            }
        }

        /**
         * Render component in the DOM
         * 
         * @returns {undefined}
         */
        render() {

            // Render template

            let html = this.template();

            html = html.replace(/{{content}}/g, this.innerHTML);

            this.innerHTML = html;

            // After render template

            this.initEvents();
        }

        /**
         * Component template
         * 
         * @returns {undefined}
         */
         template() {

            if (window.templateSideDrawer) {

                return window.templateSideDrawer;

            } else {

                return `
                    <div data-overlay aria-hidden="true"></div>
                    <div data-container>
                        <button data-close aria-label="Close drawer">
                            <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M18.1872 5.81292C18.4801 6.10581 18.4801 6.58068 18.1872 6.87358L13.0607 12.0001L18.1872 17.1266C18.4801 17.4195 18.4801 17.8944 18.1872 18.1873C17.8943 18.4802 17.4194 18.4802 17.1265 18.1873L12 13.0608L6.87348 18.1873C6.58058 18.4802 6.10571 18.4802 5.81282 18.1873C5.51992 17.8944 5.51992 17.4195 5.81282 17.1266L10.9393 12.0001L5.81282 6.87358C5.51992 6.58068 5.51992 6.10581 5.81282 5.81292C6.10571 5.52002 6.58058 5.52002 6.87348 5.81292L12 10.9394L17.1265 5.81292C17.4194 5.52002 17.8943 5.52002 18.1872 5.81292Z"
                                fill="currentColor" />
                            </svg>
                            Close
                        </button>
                        <div data-content>{{content}}</div>
                    </div>
                `;
            }
        }

        /**
         * Init component events
         * 
         * @returns {undefined}
         */
        initEvents() {

            this.initFocusTrap();

            this.initTriggers();

            // Close on press escape
            window.addEventListener('escape', () => {
                this.close();
            });
        }

        /**
         * Init triggers
         * 
         * @returns {undefined}
         */
        initTriggers() {

            if(this.id) {

                document.querySelectorAll('[data-drawer-target="'+this.id+'"]').forEach( element => {
                    element.addEventListener('click', this.open.bind(this));
                });

            }

            this.querySelector('[data-overlay]').addEventListener('click', this.close.bind(this));

            this.querySelector('[data-close]').addEventListener('click', this.close.bind(this));
        }

        /**
         * Check if the drawer is open
         * 
         * @returns {boolean}
         */
        isOpen() {

            return (this.classList.contains('active')) ? true : false;
        }

        /**
         * Disable scroll on html and body
         * 
         * @returns {undefined}
         */
        disableScroll() {
            this.scrollPosition = window.pageYOffset;
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${this.scrollPosition}px`;
            document.body.style.width = '100%';
        }

        /**
         * Enable scroll on html and body
         * 
         * @returns {undefined}
         */
        enableScroll() {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, this.scrollPosition);
        }

        /**
         * Open drawer
         * 
         * @returns {undefined}
         */
        open(event) {

            if(event) event.preventDefault();

            if (!this.isOpen()) {
                this.disableScroll();
                this.style.display = '';
                this.setAttribute('aria-hidden', 'false');

                setTimeout(() => {
                    this.classList.add('active');
                    this.classList.add('transition-in');
                }, 100);

                setTimeout(() => {
                    this.classList.remove('transition-in');
                    this.activeFocusTrap();
                    // Execute afterOpen callback if it exists
                    if (typeof this.afterOpen === 'function') {
                        this.afterOpen();
                    }
                }, this.config.animationDuration);
            }
        }

        /**
         * Close drawer
         * 
         * @returns {undefined}
         */
        close() {
            if (this.isOpen()) {
                // Execute beforeClose callback if it exists
                if (typeof this.beforeClose === 'function') {
                    this.beforeClose();
                }
                
                this.classList.add('transition-out');
                this.disableFocusTrap();
                
                // Remove focus from any element inside the drawer
                if (document.activeElement && this.contains(document.activeElement)) {
                    document.activeElement.blur();
                }

                setTimeout(() => {
                    this.classList.remove('transition-out');
                    this.classList.remove('active');
                    // Set aria-hidden after transition and focus management
                    this.setAttribute('aria-hidden', 'true');
                    this.enableScroll();
                }, this.config.animationDuration);

                setTimeout(() => {
                    this.style.display = 'none';
                }, this.config.animationDuration + 100);
            }
        }

        /**
         * Init focus trap
         * 
         * @returns {undefined}
         */
        initFocusTrap() {

            if(focusTrap) {
                this.focusTrap = focusTrap.createFocusTrap(this, { clickOutsideDeactivates: true }); 
            }
        }

        /**
         * Disable focus trap
         * 
         * @returns {undefined}
         */
        disableFocusTrap() {

            if (this.focusTrap) {
                this.focusTrap.deactivate();
            }
        }

        /**
         * Active focus trap
         * 
         * @returns {undefined}
         */
        activeFocusTrap() {

            if (this.focusTrap) {
                this.focusTrap.activate();
            }
        }

        /**
         * Disable the side drawer functionality
         * Removes event listeners and prevents opening
         * 
         * @returns {undefined}
         */
        disable() {
            this.classList.add('disabled');
        }

        /**
         * Enable the side drawer functionality
         * Restores event listeners and allows opening
         * 
         * @returns {undefined}
         */
        enable() {
            this.classList.remove('disabled');
        }
    }

    customElements.define(customElements.component, SideDrawer);
}