/**
 * Style Guide UI
 * 
 * @module style-guide
 * @version 1.1.0
 * @extends HTMLElement
 */

class styleGuideUi extends HTMLElement {

    constructor() {

        super();

        this.buildSidebar();
        
        // this.initScreenTypeButtons();

        this.initSections();

        if (window.location.hash) {
            this.showSection(window.location.hash.replace('#',''));
        } else {
            this.showSection('section_0');
        }
    }

    initSections() {

        this.sections = [];

        this.querySelectorAll('styleguide-section').forEach((section, index) => {

            section.id = 'section_' + index;

            this.addSection(section.id, section.dataset.title, section.dataset.group, section.dataset.status);
        });
    }

    buildSidebar() {

        let sidebarDiv = document.createElement('div');

        sidebarDiv.setAttribute('data-sidebar', true);

        this.append(sidebarDiv);

        this.sidebar = sidebarDiv;

        this.initHideSidebarButton();
    }

    initHideSidebarButton() {

        let button = document.createElement('button');

        button.innerText = 'Toggle Sidebar';

        button.setAttribute('data-sidebar-toggle', true);

        button.addEventListener('click', event => this.toggleSidebar() );

        this.sidebar.append(button);

        if(localStorage.getItem('hide-sidebar') ==  'true') {
            this.hideSidebar();
        }
    }

    toggleSidebar() {
        ( this.classList.contains('hide-sidebar') ) ? this.showSidebar() : this.hideSidebar();
    }

    hideSidebar() {
        this.classList.add('hide-sidebar');
        localStorage.setItem('hide-sidebar', true);
    }

    showSidebar() {
        this.classList.remove('hide-sidebar');
        localStorage.setItem('hide-sidebar', false);
    }

    initScreenTypeButtons() {

        let container = document.createElement('div');

        container.dataset.screenOptions = true;

        let btnMobile = document.createElement('button');
        btnMobile.dataset.screenOption = 'mobile';
        btnMobile.innerText = 'Mobile';
        btnMobile.addEventListener('click', () => {
            this.resizeActiveSection('375px', '812px');
        });
        container.append(btnMobile);

        let btnTablet = document.createElement('button');
        btnTablet.dataset.screenOption = 'tablet';
        btnTablet.innerText = 'Tablet';
        btnTablet.addEventListener('click', () => {
            this.resizeActiveSection('800px', '99%');
        });
        container.append(btnTablet);

        let btnDesktop = document.createElement('button');
        btnDesktop.dataset.screenOption = 'desktop';
        btnDesktop.innerText = 'Desktop';
        btnDesktop.addEventListener('click', () => {
            this.resizeActiveSection('99%', '99%');
        });
        container.append(btnDesktop);

        this.sidebar.append(container);
    }

    addSidebarLink(id, title, group, status) {

        let link = document.createElement('a');

        link.innerHTML = '<span>' + title + '</span>';

        link.href = '#' + id;

        link.dataset.sectionId = id;

        if (typeof status != 'undefined') {
            link.classList.add(status);
        }

        link.addEventListener('click', event => {

            event.preventDefault();

            this.hideAllSection();

            this.showSection(event.target.dataset.sectionId);
        });

        let groupElement = (group) ? this.getGroupElement(group) : this.getGroupElement('General');

        groupElement.append(link);
    }

    getGroupElement(groupId) {

        let groupElement = this.sidebar.querySelector('[data-group="'+groupId+'"]');

        if (!groupElement) {

            groupElement = document.createElement('div');

            groupElement.dataset.group = groupId;

            this.sidebar.append(groupElement);
        }

        return groupElement;
    }

    addSection(id, title, group, status) {

        this.sections.push({
            id: id,
            title: title,
            group: group,
            status: status
        });

        this.addSidebarLink(id, title, group, status);

        this.hideSection(id);
    }

    showSection(id) {

        let section = this.querySelector('#'+id);
        
        if (section) {

            section.dataset.active = true;
    
            section.style.display = 'block';

            window.location = '#'+id;
    
            this.activeSidebarLink(id);
        }
    }

    hideSection(id) {

        let section = this.querySelector('#'+id);

        section.dataset.active = false;

        section.style.display = 'none';
    }

    hideAllSection() {

        this.querySelectorAll('styleguide-section[data-active="true"]').forEach(section => {
            this.hideSection(section.id);
        });
    }

    activeSidebarLink(id) {

        let activeLink = this.sidebar.querySelector('.active');

        if (activeLink) {
            activeLink.classList.remove('active');
        }

        this.sidebar.querySelector('[data-section-id="'+id+'"]').classList.add('active');
    }

    resizeActiveSection(width, height) {

        let section = this.getActiveSection();

        section.style.width = width;
        section.style.height = height;
    }

    getActiveSection() {
        return this.querySelector('styleguide-section[data-active="true"]');
    }

    
}

customElements.define('styleguide-ui', styleGuideUi);

class styleGuideSection extends HTMLElement {

    constructor() {

        super();

        this.render();
    }

    render() {

        let title = '<h2 class="font-bold text-4xl mb-6">' + this.dataset.title + '</h2> <hr class="mb-6"></hr>';

        this.innerHTML = title + this.innerHTML;
    }
}

customElements.define('styleguide-section', styleGuideSection);