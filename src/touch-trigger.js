/**
 * touch-trigger(触摸滑动方向插件)
 */

import { bindHandler, removeHandler, getScrollable } from "./util";

class TouchTrigger {
	constructor(el, options) {
		this.options = {
			// 内容滚动和滑动同步，即内容滚动时才能触发事件
			isScrollSlideSync: false,
			// 是否阻止内容滚动，设置为 true 时，isScrollSlideSync 将不生效
			isPreventScroll: false,
			// 是否监听 X 方向滑动
			slideX: false,
			// 是否监听 Y 方向滑动
			slideY: true,
			// X 单方向滑动距离触发事件阈值
			thresholdX: 50,
			// Y 单方向滑动距离触发事件阈值
			thresholdY: 50,
			// 触摸滑动速度：距离/每秒
			slideSpeed: 200,
			// X 方向触摸滑动事件
			onSlideX: null,
			// Y 方向触摸滑动事件
			onSlideY: null,
		};

		this.scrollEl = el;
		this.startX = 0; // 单方向(向左或向右)起始位置
		this.startY = 0; // 单方向(向上或向下)起始位置
		this.startTimeX = 0; // 单方向(向左或向右)起始时间点
		this.startTimeY = 0; // 单方向(向上或向下)起始时间点
		this.lastestX = 0; // 最近一次的 水平位置
		this.lastestY = 0; // 最近一次的 垂直位置
		this.level = null; // 当前滑动的水平方向：向左(left)、向右(right)
		this.vertical = null; // 当前滑动的垂直方向：向上(up)、向下(down)
		this.isEmitSlideX = false; // 是否触发过 X 方向事件
		this.isEmitSlideY = false; // 是否触发过 Y 方向事件
		this.isPreventEventX = false; // 是否阻止 X 方向的触发事件
		this.isPreventEventY = false; // 是否阻止 Y 方向的触发事件

		// 绑定触摸事件
		this.bindTouchHandler();
	}

	// 绑定 touch 事件
	bindTouchHandler() {
		bindHandler(this.scrollEl, "touchstart", this.handleTouchEvent);
		bindHandler(this.scrollEl, "touchend", this.handleTouchEvent);
		bindHandler(this.scrollEl, "touchmove", this.handleTouchEvent);
	}

	// 解除 touch 事件
	removeTouchHandler() {
		removeHandler(this.scrollEl, "touchstart", this.handleTouchEvent);
		removeHandler(this.scrollEl, "touchend", this.handleTouchEvent);
		removeHandler(this.scrollEl, "touchmove", this.handleTouchEvent);
	}

	// 重置数据
	resetData(startX, startY) {
		const now = new Date().getTime();
		this.startX = startX;
		this.startY = startY;
		this.startTimeX = now;
		this.startTimeY = now;
		this.isEmitSlideX = false;
		this.isEmitSlideY = false;
		this.lastestX = startX;
		this.lastestY = startY;
		this.level = null;
		this.vertical = null;
	}

	// 滚动和滑动同步，阻止事件
	scrollSlideSync() {
		const scrollEl = this.scrollEl;

		// 阻止内容滚动，设置为 true 时，isScrollSlideSync 将不生效
		if (this.isPreventScroll) {
			return;
		}

		if (this.isScrollSlideSync) {
			const scrollable = getScrollable(scrollEl);
			this.isPreventEventX =
				scrollEl.scrollLeft === 0 || scrollEl.scrollLeft === scrollable.x;
			this.isPreventEventY =
				scrollEl.scrollTop === 0 || scrollEl.scrollTop === scrollable.y;
		}
	}

	// 记录单方向和该单方向的开始值
	updateDirection(pageX, pageY) {
		if (!this.level && !this.vertical) {
			// 首次滑动，记录方向
			this.level = pageX > this.lastestX ? "right" : "left";
			this.vertical = pageY > this.lastestY ? "down" : "up";
		} else {
			// 反向滑动，更新方向和记录值、重置触发事件
			if (this.level === "right" && pageX < this.lastestX) {
				this.level = "left";
				this.startX = this.lastestX;
				this.isEmitSlideX = false;
				this.startTimeX = new Date().getTime();
			} else if (this.level === "left" && pageX > this.lastestX) {
				this.level = "right";
				this.startX = this.lastestX;
				this.isEmitSlideX = false;
				this.startTimeX = new Date().getTime();
			}
			if (this.vertical === "up" && pageY > this.lastestY) {
				this.vertical = "down";
				this.startY = this.lastestY;
				this.isEmitSlideY = false;
				this.startTimeY = new Date().getTime();
			} else if (this.vertical === "down" && pageY < this.lastestY) {
				this.vertical = "up";
				this.startY = this.lastestY;
				this.isEmitSlideY = false;
				this.startTimeY = new Date().getTime();
			}
		}

		// 更新最近值
		this.lastestX = pageX;
		this.lastestY = pageY;
	}

	// 触发滑动单方向事件
	emitSlideDirection(pageX, pageY) {
		const spanX = Math.abs(pageX - this.startX);
		const spanY = Math.abs(pageY - this.startY);
		const {
			slideX,
			slideY,
			thresholdX,
			thresholdY,
			slideSpeed,
			onSlideX,
		  onSlideY,
		} = this.options;

		if (
			!this.isPreventEventX &&
			!this.isEmitSlideX &&
			slideX &&
			spanX > thresholdX
		) {
			const timeDiff = (now - this.startTimeX) / 1000;
			if (spanX / timeDiff > slideSpeed) {
				this.isEmitSlideX = true;
				if (onSlideX) {
					onSlideX(this.level);
				}
			}
		}
		if (
			!this.isPreventEventY &&
			!this.isEmitSlideY &&
			slideY &&
			spanY > thresholdY
		) {
			const timeDiff = (now - this.startTimeY) / 1000;
			if (spanY / timeDiff > slideSpeed) {
				this.isEmitSlideY = true;
				if (onSlideY) {
					onSlideY(this.vertical);
				}
			}
		}
	}

	// 触摸事件回调
	handleTouchEvent(event) {
		switch (event.type) {
			case "touchstart": {
				const pageX = event.touches[0].pageX;
				const pageY = event.touches[0].pageY;
				this.resetData(pageX, pageY);
				break;
			}
			case "touchmove": {
				if (this.isPreventScroll) {
					event.preventDefault();
				}

				const pageX = event.touches[0].pageX;
				const pageY = event.touches[0].pageY;

				this.scrollSlideSync();
				this.updateDirection(pageX, pageY);
				this.emitSlideDirection(pageX, pageY);
				break;
			}
			case "touchend": {
				const pageX = event.changedTouches[0].pageX;
				const pageY = event.changedTouches[0].pageY;

				this.scrollSlideSync();
				this.updateDirection(pageX, pageY);
				this.emitSlideDirection(pageX, pageY);
				break;
			}
			default:
				break;
		}
	}
}

export default TouchTrigger;
