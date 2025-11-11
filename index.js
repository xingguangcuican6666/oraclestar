import "./js/loading.js"
import "./js/home.js"
import "./js/pageSwitch.js"
import { HashRouter } from './js/pwa.js';
import "./js/btn/all.js"
const router = new HashRouter(['home', 'doc', 'SCE', 'ai', 'cloud', 'api']);

function applyOrientationLayout(){
    const nav = document.getElementById('quick-nav');
    if(!nav) return;
    const isLandscape = window.innerWidth > window.innerHeight;
    // Add/remove helper class if needed for future fine-grained styling
    nav.classList.toggle('landscape', isLandscape);
    // Ensure nav stays visible after orientation changes
    nav.style.visibility = 'visible';
    nav.style.display = 'block';
    // Avoid it appearing hidden due to previous animation opacity
    nav.querySelectorAll('li').forEach(li=>{ li.style.opacity = '1'; });
}
window.addEventListener('resize', applyOrientationLayout);
window.addEventListener('orientationchange', applyOrientationLayout);
// Run after DOM ready and also after load to catch dynamic viewport changes
document.addEventListener('DOMContentLoaded', applyOrientationLayout);
window.addEventListener('load', applyOrientationLayout);
