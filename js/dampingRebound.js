export function bindDampingRebound(element, targetX, targetY, options = {}){
	const config = {
		stiffness: 300,
		damping: 25,
		mass: 1,
		precision: 0.1,
		...options
	};

	if (element._dampingAnimationId){
		cancelAnimationFrame(element._dampingAnimationId);
	}
	
	const currentTransform = parseElementTransform(element);
	let currentX = currentTransform.x;
	let currentY = currentTransform.y;
	let velocityX = 0;
	let velocityY = 0;
	
	element._dampingStartTime = null;
	
	const animate = (timestamp) => {
		if (!element._dampingStartTime){
			element._dampingStartTime = timestamp;
		}
		
		const deltaTime = Math.min(timestamp - element._dampingStartTime, 4) / 1000;
		element._dampingStartTime = timestamp;
		
		const distanceX = targetX - currentX;
		const distanceY = targetY - currentY;
		
		const accelerationX = (config.stiffness * distanceX - config.damping * velocityX) / config.mass;
		const accelerationY = (config.stiffness * distanceY - config.damping * velocityY) / config.mass;
		
		velocityX += accelerationX * deltaTime;
		velocityY += accelerationY * deltaTime;
	
		currentX += velocityX * deltaTime;
		currentY += velocityY * deltaTime;
		
		element.style.transform = `translate(${currentX}px, ${currentY}px)`;
		
		const totalDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
		const totalSpeed = Math.sqrt(velocityX ** 2 + velocityY ** 2);
		
		if (totalDistance > config.precision || totalSpeed > config.precision){
			element._dampingAnimationId = requestAnimationFrame(animate);
		} else {
			element.style.transform = `translate(${targetX}px, ${targetY}px)`;
			element._dampingAnimationId = null;
		}
	};
	
	element._dampingAnimationId = requestAnimationFrame(animate);
	
	return {
		stop: ()=>{
			if (element._dampingAnimationId){
				cancelAnimationFrame(element._dampingAnimationId);
				element._dampingAnimationId = null;
			}
		},
		updateTarget: (newX, newY)=>{
			targetX = newX;
			targetY = newY;
		}
	};
}

function parseElementTransform(element){
	const style = window.getComputedStyle(element);
	const transform = style.transform;
	
	if (transform === 'none'){
		return {x : 0, y : 0};
	}
	
	const translateMatch = transform.match(/translate\(([^)]+)\)/);
	if (translateMatch){
		const values = translateMatch[1].split(',').map(val =>
			parseFloat(val.trim().replace('px', ''))
		);
		return { x: values[0] || 0, y: values[1] || 0 };
	}
	
	const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
	if (matrixMatch){
		const values = matrixMatch[1].split(',').map(parseFloat)
		return { x : values[4] || 0, y : values[5] || 0};
	}
	
	return { x : 0, y : 0 };
}

export function getCenterDistance(element, targetX, targetY) {
	const rect = element.getBoundingClientRect();
	
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;
	
	const distanceX = targetX - centerX;
	const distanceY = targetY - centerY;
	
	return {
		distanceX: distanceX,
		distanceY: distanceY
	};
}

/**
 * 使用阻尼弹簧模型将一个元素动画到另一个目标元素的位置和大小。
 * 注意：此函数驱动 'left', 'top', 'width', 'height' 属性。
 * 动画元素 'element' 必须具有 'position: absolute/fixed/relative' 才能生效。
 * * @param {HTMLElement} element - 将要执行动画的DOM元素。
 * @param {HTMLElement} targetElement - 提供目标样式（位置和大小）的DOM元素。
 * @param {object} [options] - 阻尼动画的配置项 (stiffness, damping, mass, precision)。
 * @returns {{stop: function, updateTarget: function}} - 控制动画的对象。
 */
export function animateElementToTarget(element, targetElement, options = {}) {
	const config = {
		stiffness: 300, // 刚度 (弹簧的"硬度")
		damping: 25,   // 阻尼 (摩擦力)
		mass: 1,         // 质量
		precision: 0.1,  // 停止动画的精度阈值
		...options
	};
	
	// 取消该元素上可能正在运行的同类动画
	if (element._styleDampingAnimationId) {
		cancelAnimationFrame(element._styleDampingAnimationId);
	}
	
	// 1. 获取初始状态 (从 getComputedStyle)
	//    我们必须假设 left/top/width/height 具有可解析的像素值。
	const style = window.getComputedStyle(element);
	let currentLeft = parseFloat(style.left) || 0;
	let currentTop = parseFloat(style.top) || 0;
	let currentWidth = parseFloat(style.width) || 0;
	let currentHeight = parseFloat(style.height) || 0;
	
	// 2. 初始化物理变量
	let velocityLeft = 0;
	let velocityTop = 0;
	let velocityWidth = 0;
	let velocityHeight = 0;
	
	// 3. 声明目标状态变量
	let targetLeft, targetTop, targetWidth, targetHeight;
	
	/**
	 * 计算并更新目标值
	 * 这是最复杂的部分，因为它必须将被动画元素的 'left'/'top'
	 * 坐标系（相对于 offsetParent）与目标元素的 'BoundingClientRect'
	 * 坐标系（相对于 viewport）进行转换。
	 */
	const updateTargetValues = () => {
		const targetRect = targetElement.getBoundingClientRect();
		
		// 确定 element 的偏移上下文
		const parent = element.offsetParent;
		const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0 };
		
		// offsetParent 的 clientLeft/Top 是其 border 的宽度
		const parentClientLeft = parent ? parent.clientLeft : 0;
		const parentClientTop = parent ? parent.clientTop : 0;
		
		// 计算目标 'left' 和 'top'，使其相对于 offsetParent 的 *padding box*
		// 这对应于 'style.left' 和 'style.top' 的定位方式
		targetLeft = targetRect.left - parentRect.left - parentClientLeft;
		targetTop = targetRect.top - parentRect.top - parentClientTop;
		
		// BoundingRect 的 width/height 是 border-box 的尺寸
		targetWidth = targetRect.width;
		targetHeight = targetRect.height;
		
		// 关键：如果 element 是 'content-box'，
		// 我们设置的 'width'/'height' 样式需要减去它 *自身* 的 padding 和 border，
		// 这样它最终的 BoundingRect 才能匹配 target。
		if (style.boxSizing === 'content-box') {
			targetWidth -= (parseFloat(style.paddingLeft) || 0) +
				(parseFloat(style.paddingRight) || 0) +
				(parseFloat(style.borderLeftWidth) || 0) +
				(parseFloat(style.borderRightWidth) || 0);
			
			targetHeight -= (parseFloat(style.paddingTop) || 0) +
				(parseFloat(style.paddingBottom) || 0) +
				(parseFloat(style.borderTopWidth) || 0) +
				(parseFloat(style.borderBottomWidth) || 0);
		}
	};
	
	// 首次计算目标值
	updateTargetValues();
	
	element._styleDampingStartTime = null;
	
	const animate = (timestamp) => {
		if (!element._styleDampingStartTime) {
			element._styleDampingStartTime = timestamp;
		}
		
		// 限制 deltaTime 最大为 4ms (0.004s)，防止物理计算爆炸
		const deltaTime = Math.min(timestamp - element._styleDampingStartTime, 4) / 1000;
		element._styleDampingStartTime = timestamp;
		
		// --- 独立计算四个维度的物理状态 ---
		
		// 1. Left
		const dLeft = targetLeft - currentLeft;
		const aLeft = (config.stiffness * dLeft - config.damping * velocityLeft) / config.mass;
		velocityLeft += aLeft * deltaTime;
		currentLeft += velocityLeft * deltaTime;
		
		// 2. Top
		const dTop = targetTop - currentTop;
		const aTop = (config.stiffness * dTop - config.damping * velocityTop) / config.mass;
		velocityTop += aTop * deltaTime;
		currentTop += velocityTop * deltaTime;
		
		// 3. Width
		const dWidth = targetWidth - currentWidth;
		const aWidth = (config.stiffness * dWidth - config.damping * velocityWidth) / config.mass;
		velocityWidth += aWidth * deltaTime;
		currentWidth += velocityWidth * deltaTime;
		
		// 4. Height
		const dHeight = targetHeight - currentHeight;
		const aHeight = (config.stiffness * dHeight - config.damping * velocityHeight) / config.mass;
		velocityHeight += aHeight * deltaTime;
		currentHeight += velocityHeight * deltaTime;
		
		// --- 应用样式 ---
		element.style.left = `${currentLeft}px`;
		element.style.top = `${currentTop}px`;
		element.style.width = `${currentWidth}px`;
		element.style.height = `${currentHeight}px`;
		
		// --- 检查停止条件 ---
		const totalDistance = Math.sqrt(dLeft**2 + dTop**2 + dWidth**2 + dHeight**2);
		const totalSpeed = Math.sqrt(velocityLeft**2 + velocityTop**2 + velocityWidth**2 + velocityHeight**2);
		
		if (totalDistance > config.precision || totalSpeed > config.precision) {
			element._styleDampingAnimationId = requestAnimationFrame(animate);
		} else {
			// 动画结束，精确设置到目标值
			element.style.left = `${targetLeft}px`;
			element.style.top = `${targetTop}px`;
			element.style.width = `${targetWidth}px`;
			element.style.height = `${targetHeight}px`;
			element._styleDampingAnimationId = null;
		}
	};
	
	element._styleDampingAnimationId = requestAnimationFrame(animate);
	
	return {
		/**
		 * 立即停止动画
		 */
		stop: () => {
			if (element._styleDampingAnimationId) {
				cancelAnimationFrame(element._styleDampingAnimationId);
				element._styleDampingAnimationId = null;
			}
		},
		/**
		 * 更新目标元素的位置（例如，如果 targetElement 移动了）
		 * 并重新启动动画（如果已停止）。
		 */
		updateTarget: () => {
			// 重新计算目标值
			updateTargetValues();
			
			// 如果动画已停止，则重新启动
			if (!element._styleDampingAnimationId) {
				element._styleDampingAnimationId = requestAnimationFrame(animate);
			}
		}
	};
}