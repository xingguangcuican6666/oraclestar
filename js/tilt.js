export function handleObjectTilt(event) {
	const obj = event.currentTarget;
	if (!obj) return;
	
	const rect = obj.getBoundingClientRect();
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;
	
	const mouseX = event.clientX - centerX;
	const mouseY = event.clientY - centerY;
	
	const rotateX = (mouseY / rect.height) * -30;
	const rotateY = (mouseX / rect.width) * 30;
	
	const translateZ = Math.sqrt(mouseX * mouseX + mouseY * mouseY) * 0.08;
	
	obj.style.transform = `
        perspective(1500px)
        rotateX(${Math.max(-6, Math.min(30, rotateX))}deg)
        rotateY(${Math.max(-6, Math.min(30, rotateY))}deg)
        translateZ(${Math.min(15, translateZ)}px)
        scale(1.5)
    `;
}

export function resetTilt(event) {
	const obj = event.currentTarget;
	
	obj.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        translateZ(0px)
        scale(1)
    `;
}