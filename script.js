// Auto-scroll to home on load
window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
});

// Create bubbles helper
function createBubbles(containerId, minCount = 5, maxCount = 7, className = 'home-bubble') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

    for (let i = 0; i < count; i++) {
        const bubble = document.createElement('div');
        bubble.className = className;
        
        const size = 40 + Math.random() * 80;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = 12 + Math.random() * 10;
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${x}%`;
        bubble.style.top = `${y}%`;
        bubble.style.animationDelay = `${delay}s`;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.opacity = 0.4 + Math.random() * 0.3;
        
        container.appendChild(bubble);
    }
}

// Unified smooth scroll with offset
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}

// ACCURATE ACTIVE SECTION HIGHLIGHTING
function updateActiveNav() {
    const sections = ['home', 'about-me', 'company', 'logs', 'learnings', 'gallery', 'pictorial', 'culminating', 'closing'];
    const navbarHeight = 80;
    let current = 'home';

    for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const top = rect.top;
        const bottom = rect.bottom;

        if (top <= navbarHeight + 30 && bottom >= navbarHeight + 30) {
            current = id;
            break;
        }
    }

    document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
        const target = link.getAttribute('href').substring(1);
        link.classList.toggle('active', target === current);
    });
}

// Event listeners
document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href').substring(1);
        scrollToSection(target);
        closeSidebar();
        setTimeout(updateActiveNav, 400);
    });
});

document.querySelector('.explore-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSection('about-me');
    setTimeout(updateActiveNav, 400);
});

document.querySelectorAll('.logo-link, .mobile-logo-link').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(updateActiveNav, 400);
    });
});

// Mobile sidebar
function toggleMenu() {
    document.getElementById('mobileSidebar').classList.add('active');
    let overlay = document.getElementById('sidebarOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sidebarOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeSidebar);
    } else {
        overlay.style.display = 'block';
    }
}

function closeSidebar() {
    document.getElementById('mobileSidebar').classList.remove('active');
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.style.display = 'none';
}

// LIGHTBOX
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let lightboxImages = [];
let currentLightboxIndex = 0;

function openLightbox(images, index) {
    lightboxImages = images;
    currentLightboxIndex = index;
    lightboxImg.src = lightboxImages[currentLightboxIndex];
    lightbox.style.display = 'flex';
}

function closeLightbox() {
    lightbox.style.display = 'none';
}

function lightboxNext() {
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxImages.length;
    lightboxImg.src = lightboxImages[currentLightboxIndex];
}

function lightboxPrev() {
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    lightboxImg.src = lightboxImages[currentLightboxIndex];
}

document.querySelector('.lightbox .close')?.addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev')?.addEventListener('click', lightboxPrev);
document.querySelector('.lightbox-next')?.addEventListener('click', lightboxNext);
lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') lightboxNext();
        if (e.key === 'ArrowLeft') lightboxPrev();
    }
});

// ✅ UNIVERSAL SWIPE/DRAG SUPPORT
function addSwipeSupport(container, onPrev, onNext) {
    let startX = 0;
    let startY = 0;
    let isScrolling = false;

    container.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        startX = e.clientX;
        startY = e.clientY;
        isScrolling = false;
        container.setPointerCapture(e.pointerId);
    });

    container.addEventListener('pointermove', (e) => {
        if (isScrolling) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dy) > Math.abs(dx)) {
            isScrolling = true;
        }
    });

    container.addEventListener('pointerup', (e) => {
        if (isScrolling) return;
        const dx = e.clientX - startX;
        const threshold = 50;

        if (dx > threshold) {
            onPrev();
        } else if (dx < -threshold) {
            onNext();
        }
    });

    container.addEventListener('dragstart', (e) => e.preventDefault());
}

// DAY CAROUSEL CLASS
class DayCarousel {
    constructor(container, dayKey, imageCount = 3) {
        this.container = container;
        this.dayKey = dayKey;
        this.imageCount = imageCount;
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        this.inactivityTimer = null;
        this.userInteracted = false;
        this.imagePaths = [];
        this.init();
    }

    getImagePath(i) {
        if (this.dayKey === 'culminating') {
            return `images/culminating/culminating_1_${i}.jpg`;
        } else if (this.dayKey === 'admins') {
            return `images/admins/admins_1_${i}.jpg`;
        } else if (this.dayKey === 'arkasia') {
            const files = ['Ark-Asia_Logo.jpg', 'complete_team.jpg'];
            return `images/arkasia/${files[i - 1]}`;
        } else {
            return `images/logs/day${this.dayKey}_${i}.jpg`;
        }
    }

    init() {
        for (let i = 1; i <= this.imageCount; i++) {
            this.imagePaths.push(this.getImagePath(i));
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'day-gallery-container';
        const slider = document.createElement('div');
        slider.className = 'day-slider';

        this.imagePaths.forEach((src, idx) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Item ${idx + 1}`;
            img.addEventListener('click', () => {
                openLightbox(this.imagePaths, idx);
                this.onUserInteraction();
            });
            slider.appendChild(img);
        });

        const prevBtn = document.createElement('button');
        prevBtn.className = 'day-prev';
        prevBtn.innerHTML = '‹';
        prevBtn.addEventListener('click', () => this.prev());

        const nextBtn = document.createElement('button');
        nextBtn.className = 'day-next';
        nextBtn.innerHTML = '›';
        nextBtn.addEventListener('click', () => this.next());

        wrapper.appendChild(prevBtn);
        wrapper.appendChild(slider);
        wrapper.appendChild(nextBtn);
        this.container.appendChild(wrapper);

        this.sliderEl = slider;
        this.updateSlider();
        this.startAutoPlay();
        this.attachListeners(wrapper);

        addSwipeSupport(wrapper, () => this.prev(), () => this.next());
    }

    updateSlider() {
        this.sliderEl.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }

    prev() {
        if (this.currentSlide > 0) this.currentSlide--;
        this.updateSlider();
        this.onUserInteraction();
    }

    next() {
        if (this.currentSlide < this.imageCount - 1) this.currentSlide++;
        this.updateSlider();
        this.onUserInteraction();
    }

    onUserInteraction() {
        this.userInteracted = true;
        this.resetAutoPlay();
    }

    resetAutoPlay() {
        clearInterval(this.autoPlayInterval);
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
            this.userInteracted = false;
            this.startAutoPlay();
        }, 10000);
    }

    startAutoPlay() {
        if (this.userInteracted) return;
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = setInterval(() => this.next(), 3500);
    }

    attachListeners(wrapper) {
        wrapper.addEventListener('mouseenter', () => this.onUserInteraction());
        wrapper.addEventListener('mouseleave', () => this.resetAutoPlay());
        wrapper.addEventListener('touchstart', () => this.onUserInteraction());
    }
}

// MAIN GALLERY
const totalImages = 66;
const gallerySlider = document.getElementById('gallerySlider');

for (let i = 1; i <= totalImages; i++) {
    const img = document.createElement('img');
    img.src = `images/gallery/r${i}.jpg`;
    img.alt = `Gallery Image ${i}`;
    img.addEventListener('click', () => {
        const paths = Array.from({length: totalImages}, (_, i) => `images/gallery/r${i + 1}.jpg`);
        openLightbox(paths, i - 1);
    });
    gallerySlider.appendChild(img);
}

let mainCurrentSlide = 0;
const mainPrevBtn = document.querySelector('.prev');
const mainNextBtn = document.querySelector('.next');

function getMainVisibleCount() {
    if (window.innerWidth <= 820) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

function updateMainSlider() {
    const visible = getMainVisibleCount();
    const maxSlide = totalImages - visible;
    if (mainCurrentSlide > maxSlide) mainCurrentSlide = maxSlide;
    const itemWidth = gallerySlider.children[0]?.offsetWidth + 10 || 290;
    gallerySlider.style.transform = `translateX(${-mainCurrentSlide * itemWidth}px)`;
}

function onMainInteraction() {
    resetMainAutoPlay();
}

let mainAutoPlay;
let mainInactivityTimer;

function resetMainAutoPlay() {
    clearInterval(mainAutoPlay);
    clearTimeout(mainInactivityTimer);
    mainInactivityTimer = setTimeout(() => {
        startMainAutoPlay();
    }, 10000);
}

function startMainAutoPlay() {
    clearInterval(mainAutoPlay);
    mainAutoPlay = setInterval(() => mainNext(), 4000);
}

function mainPrev() {
    if (mainCurrentSlide > 0) mainCurrentSlide--;
    updateMainSlider();
    onMainInteraction();
}

function mainNext() {
    const visible = getMainVisibleCount();
    if (mainCurrentSlide < totalImages - visible) mainCurrentSlide++;
    updateMainSlider();
    onMainInteraction();
}

mainPrevBtn?.addEventListener('click', mainPrev);
mainNextBtn?.addEventListener('click', mainNext);

const galleryContainer = document.querySelector('.slider-container');
if (galleryContainer) {
    addSwipeSupport(galleryContainer, mainPrev, mainNext);
}

gallerySlider?.addEventListener('mouseenter', onMainInteraction);
gallerySlider?.addEventListener('mouseleave', resetMainAutoPlay);

// INIT
document.addEventListener('DOMContentLoaded', () => {
    createBubbles('homeBubbles', 5, 7, 'home-bubble');

    for (let day = 1; day <= 10; day++) {
        const el = document.querySelector(`.day-gallery[data-day="${day}"]`);
        if (el) new DayCarousel(el, day, 3);
    }

    const culminatingEl = document.querySelector('.day-gallery[data-day="culminating"]');
    if (culminatingEl) new DayCarousel(culminatingEl, 'culminating', 3);

    const adminsEl = document.querySelector('.day-gallery[data-day="admins"]');
    if (adminsEl) new DayCarousel(adminsEl, 'admins', 6);

    const arkasiaEl = document.querySelector('.day-gallery[data-day="arkasia"]');
    if (arkasiaEl) new DayCarousel(arkasiaEl, 'arkasia', 2);

    window.addEventListener('load', () => {
        updateMainSlider();
        startMainAutoPlay();
        updateActiveNav();
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    });

    window.addEventListener('resize', () => {
        updateMainSlider();
        updateActiveNav();
    });
});
