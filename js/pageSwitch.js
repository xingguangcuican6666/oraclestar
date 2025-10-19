import { bindDampingRebound } from "./dampingRebound.js";

export class PageSwitcher {
    constructor() {
        this.pages = Array.from(document.querySelectorAll('main > section'));
        this.currentPageIndex = 0;
        this.isAnimating = false;
        
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.threshold = window.innerHeight * 0.1;
        this.minSwipeDistance = 10; // 最小滑动距离阈值，用于区分点击和滑动
        
        this.init();
    }
    
    init() {
        this.pages.forEach((page, index) => {
            page.style.position = 'absolute';
            page.style.width = '100%';
            page.style.height = '100%';
            
            if (index === this.currentPageIndex) {
                page.style.transform = 'translateY(0)';
                page.style.display = 'flex';
            } else {
                page.style.transform = 'translateY(100%)';
                page.style.display = 'none';
            }
        });
        
        this.bindEvents();
    }
    
    bindEvents() {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        document.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    }
    
    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        // 初始化当前坐标，防止在没有移动的情况下出现未定义值
        this.currentX = this.startX;
        this.currentY = this.startY;
    }
    
    handleMouseDown(e) {
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.isMouseDown = true;
    }
    
    handleTouchMove(e) {
        if (!this.isAnimating) {
            this.currentX = e.touches[0].clientX;
            this.currentY = e.touches[0].clientY;
            
            // 计算移动距离
            const diffX = Math.abs(this.currentX - this.startX);
            const diffY = Math.abs(this.currentY - this.startY);
            const moveDistance = Math.sqrt(diffX * diffX + diffY * diffY);
            
            // 只有当移动距离超过最小阈值时才执行滑动操作
            if (moveDistance > this.minSwipeDistance) {
                this.handleSwipeMove();
                e.preventDefault();
            }
        }
    }
    
    handleMouseMove(e) {
        if (this.isMouseDown && !this.isAnimating) {
            this.currentX = e.clientX;
            this.currentY = e.clientY;
            this.handleSwipeMove();
        }
    }
    
    handleSwipeMove() {
        const diffX = this.currentX - this.startX;
        const diffY = this.currentY - this.startY;
        
        if (Math.abs(diffY) > Math.abs(diffX)) {
            const currentPage = this.pages[this.currentPageIndex];
            
            currentPage.style.transform = `translateY(${diffY}px)`;
            
            if (diffY < 0 && this.currentPageIndex < this.pages.length - 1) {
                const nextPage = this.pages[this.currentPageIndex + 1];
                nextPage.style.display = 'flex';
                nextPage.style.transform = `translateY(${window.innerHeight + diffY}px)`;
            }
            else if (diffY > 0 && this.currentPageIndex > 0) {
                const prevPage = this.pages[this.currentPageIndex - 1];
                prevPage.style.display = 'flex';
                prevPage.style.transform = `translateY(${-window.innerHeight + diffY}px)`;
            }
        }
    }
    
    handleTouchEnd(e) {
        this.handleSwipeEnd();
    }
    
    handleMouseUp(e) {
        if (this.isMouseDown) {
            this.currentX = e.clientX;
            this.currentY = e.clientY;
            this.isMouseDown = false;
            this.handleSwipeEnd();
        }
    }
    
    handleWheel(e) {
        if (e.target.closest('#home-flag')) {
            return;
        }
        
        if (this.isAnimating) return;
        
        e.preventDefault();
        
        if (e.deltaY > 0 && this.currentPageIndex < this.pages.length - 1) {
            this.nextPage();
        } else if (e.deltaY < 0 && this.currentPageIndex > 0) {
            this.prevPage();
        }
    }
    
    handleSwipeEnd() {
        if (this.isAnimating) return;
        
        // 计算移动距离
        const diffX = this.currentX - this.startX;
        const diffY = this.currentY - this.startY;
        const moveDistance = Math.sqrt(diffX * diffX + diffY * diffY);
        
        // 只有当移动距离超过最小滑动距离阈值时才考虑页面切换
        if (moveDistance > this.minSwipeDistance) {
            if (Math.abs(diffY) > this.threshold) {
                if (diffY < 0 && this.currentPageIndex < this.pages.length - 1) {
                    this.nextPage();
                    return;
                }
                else if (diffY > 0 && this.currentPageIndex > 0) {
                    this.prevPage();
                    return;
                }
            }
        }
        
        this.resetPosition();
    }
    
    nextPage() {
        if (this.isAnimating || this.currentPageIndex >= this.pages.length - 1) return;
        
        this.isAnimating = true;
        const currentPage = this.pages[this.currentPageIndex];
        const nextPage = this.pages[this.currentPageIndex + 1];
        
        nextPage.style.display = 'flex';
        
        bindDampingRebound(currentPage, 0, -window.innerHeight);
        bindDampingRebound(nextPage, 0, 0);
        
        this.currentPageIndex++;
        
        setTimeout(() => {
            this.isAnimating = false;
            if (this.currentPageIndex > 1) {
                this.pages[this.currentPageIndex - 2].style.display = 'none';
            }
        }, 500);
    }
    
    prevPage() {
        if (this.isAnimating || this.currentPageIndex <= 0) return;
        
        this.isAnimating = true;
        const currentPage = this.pages[this.currentPageIndex];
        const prevPage = this.pages[this.currentPageIndex - 1];
        
        prevPage.style.display = 'flex';
        
        bindDampingRebound(currentPage, 0, window.innerHeight);
        bindDampingRebound(prevPage, 0, 0);
        
        this.currentPageIndex--;
        
        setTimeout(() => {
            this.isAnimating = false;
            if (this.currentPageIndex < this.pages.length - 2) {
                this.pages[this.currentPageIndex + 2].style.display = 'none';
            }
        }, 500);
    }
    
    resetPosition() {
        const currentPage = this.pages[this.currentPageIndex];
        currentPage.style.transform = 'translateY(0)';
        
        if (this.currentPageIndex > 0) {
            this.pages[this.currentPageIndex - 1].style.display = 'none';
        }
        if (this.currentPageIndex < this.pages.length - 1) {
            this.pages[this.currentPageIndex + 1].style.display = 'none';
        }
    }
    
    goToPage(index) {
        if (index < 0 || index >= this.pages.length || index === this.currentPageIndex || this.isAnimating) {
            return;
        }
        
        this.isAnimating = true;
        
        const currentPage = this.pages[this.currentPageIndex];
        const targetPage = this.pages[index];
        
        targetPage.style.display = 'flex';
        
        if (index > this.currentPageIndex) {
            bindDampingRebound(currentPage, 0, -window.innerHeight, { stiffness: 100, damping: 20, mass: 1 });
            bindDampingRebound(targetPage, 0, 0, { stiffness: 100, damping: 20, mass: 1 });
        } else {
            bindDampingRebound(currentPage, 0, window.innerHeight, { stiffness: 100, damping: 20, mass: 1 });
            bindDampingRebound(targetPage, 0, 0, { stiffness: 100, damping: 20, mass: 1 });
        }
        
        this.currentPageIndex = index;
        
        setTimeout(() => {
            this.isAnimating = false;
            this.pages.forEach((page, i) => {
                if (i !== this.currentPageIndex) {
                    page.style.display = 'none';
                }
            });
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.pageSwitcher = new PageSwitcher();
    }, 1500);
});