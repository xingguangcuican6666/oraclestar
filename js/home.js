import {bindDampingRebound} from "./dampingRebound.js";
import {handleObjectTilt, resetTilt} from "./tilt.js";

export function homeFunc(){
	const homeContent = document.querySelector('#home-content');
	
	homeContent.style.display='flex';
	
	const fadeIn = (e)=>{
		let opacity = 0;
		const interval = 25;
		const step = 0.1;
		
		const fadeInterval = setInterval(()=>{
			if (opacity < 1){
				opacity += step;
				e.style.opacity = opacity;
			} else {
				clearInterval(fadeInterval);
				e.style.display = 'flex';
			}
		}, interval);
	};
	fadeIn(homeContent)
	
	const nav = document.querySelector('#quick-nav');
	const navItems = nav.querySelectorAll('ul > li');
	
	navItems.forEach((item, index) => {
		item.style.opacity = '0';
		
		setTimeout(() => {
			bindDampingRebound(item, 0, -30, {stiffness: 100, damping: 16, mass: 1});
			
			item.style.transition = 'opacity 0.4s ease-out';
			item.style.opacity = '1';
		}, index * 100);
	});
	
	const homeTitle = document.querySelector('#home-content h1');
	
	bindDampingRebound(homeTitle,0,-5*(window.innerWidth / 100),{stiffness: 100, damping: 16, mass: 1})
	
	const projects = document.querySelectorAll(".project-card");
	
	projects.forEach((project)=>{
		project.addEventListener('mousemove',handleObjectTilt);
		project.addEventListener('mouseleave',resetTilt);
	});
}