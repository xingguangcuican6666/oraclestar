// import { PageSwitcher } from './pageSwitch.js';
export class HashRouter {
    constructor(sections) {
        this.sections = sections;
        const showSectionSafe = () => {
            if (window.pageSwitcher) {
                this.showSection();
            } else {
                setTimeout(showSectionSafe, 100);
            }
        };
        window.addEventListener('hashchange', showSectionSafe);
        window.addEventListener('DOMContentLoaded', showSectionSafe);
    }
    showSection() {
        const hash = location.hash.replace(/^#/, '') || 'home';
        var a = 0;
        this.sections.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                if (id == 'home' && hash == 'home') {
                    a = 0; 
                } else if (id == 'SCE' && hash == 'SCE') {
                    a = 1;
                } else if (id == 'doc' && hash == 'doc') {
                    a = 2;
                } else if (id == 'ai' && hash == 'ai') {
                    a = 3;
                } else if (id == 'cloud' && hash == 'cloud') {
                    a = 4;
                } else if (id == 'api' && hash == 'api') {
                    a = 5;
                }
                if (window.pageSwitcher.isAnimating) {
                    window.pageSwitcher.isAnimating = false;
                }
                window.pageSwitcher.goToPage(a);
            }
        });
    }
}