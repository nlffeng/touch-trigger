// 绑定事件
export function bindHandler(el, type, handler) {
	if (el.addEventListener) {
		el.addEventListener(type, handler, false);
	} else if (el.attachEvent) {
		el.attachEvent(`on${type}`, handler);
	} else {
		el[`on${type}`] = handler;
	}
}

// 移除事件
export function removeHandler(el, type, handler) {
	if (el.removeEventListener) {
		el.removeEventListener(type, handler, false);
	} else if (el.detachEvent) {
		el.detachEvent(`on${type}`, handler);
	} else {
		el[`on${type}`] = null;
	}
}

// 获取元素可滚动范围
export function getScrollable(el) {
	const w = el.offsetWidth;
	const h = el.offsetHeight;
	const scrollW = el.scrollWidth;
	const scrollH = el.scrollHeight;
	return {
		x: scrollW - w,
		y: scrollH - h,
	};
}
