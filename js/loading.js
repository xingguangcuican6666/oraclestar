import {
	animateElementToTarget,
} from "./dampingRebound.js";
import {homeFunc} from "./home.js";

const loading = document.querySelector('#loading');
const MAX_STAR_NUM = 100;

const LAYERS = [
	{size:[2,3],opacity:[0.8,1],speed:[5,10],z:300,count:0.1},
	{size:[1,2],opacity:[0.5,0.8],speed:[10,20],z:200,count:0.3},
	{size:[0.5,1],opacity:[0.2,0.5],speed:[20,40],z:100,count:0.6}
];

const getRandom = (min,max)=>{return Math.random()*(max-min)+min;};

const createStar = ()=>{
	LAYERS.forEach(layer =>{
		const starCount = Math.floor(MAX_STAR_NUM * layer.count);
		
		for (let i = 0; i< starCount; i++){
			const star = document.createElement('div');
			star.classList.add('loading-star');
			
			const x = getRandom(0,100);
			const y = getRandom(0,100);
			
			const size = getRandom(layer.size[0],layer.size[1]);
			
			const speed = getRandom(layer.speed[0],layer.speed[1]);
			
			const opacity = getRandom(layer.opacity[0],layer.opacity[1]);
			
			star.style.width = `${size}px`;
			star.style.height = `${size}px`;
			star.style.opacity = `${opacity}`;
			star.style.left = `${x}vw`;
			star.style.top = `${y}vh`;
			
			star.dataset.z = `${layer.z}px`;
			star.style.setProperty('--z', `${layer.z}px`);
			
			star.style.animationDuration = `${speed}s`;
			star.style.animationDelay = `-${getRandom(0,speed)}s`;
			
			star.style.setProperty('--x-end',`${getRandom(-30,-20)}vw`)
			star.style.setProperty('--y-end',`${getRandom(-30,-20)}vh`)
			
			loading.appendChild(star);
		}
	});
};

const setParallax = ()=>{
	const stars = document.querySelectorAll('.loading-star');
	
	document.addEventListener('mousemove',(e)=>{
		const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
		const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
		
		stars.forEach(star =>{
			const z = parseFloat(star.dataset.z);
			
			const deep = (500 - z)/50;
			
			const moveX = -mouseX * deep;
			const moveY = -mouseY * deep;
			
			star.style.setProperty('--parallax-x', `${moveX}px`);
			star.style.setProperty('--parallax-y', `${moveY}px`);
		});
	});
};

createStar();
setParallax();

document.addEventListener('DOMContentLoaded',()=>{
	setTimeout(()=>{
		const stars = document.querySelectorAll('.loading-star');
		const positionFlag = document.querySelector('#position-flag');
		const homeFlag = document.querySelector('#home-flag');
		
		stars.forEach(star=>{
			const fadeOut = (e)=>{
				let opacity = 1;
				const interval = 25;
				const step = 0.1;
				
				const fadeInterval = setInterval(()=>{
					if (opacity > 0){
						opacity -= step;
						e.style.opacity = opacity;
					} else {
						clearInterval(fadeInterval);
						e.style.display = 'none';
					}
				}, interval);
			};
			
			fadeOut(star)
		});
		
		const flag = document.querySelector('#loading-flag');
		animateElementToTarget(flag,positionFlag,{stiffness: 100, damping: 16, mass: 1});
		
		setTimeout(()=>{
			flag.style.display='none';
			homeFlag.style.display='inline-block';
			positionFlag.remove();
			homeFunc();
		},1000);
	},1)
});