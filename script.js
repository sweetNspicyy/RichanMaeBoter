// Auto-scroll to home on load
window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
});

// Create bubbles
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

// Scroll to section
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}

// Active nav
function updateActiveNav() {
    const sections = ['home', 'about-me', 'company', 'logs', 'learnings', 'gallery', 'video', 'pictorial', 'culminating', 'closing'];
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

// Nav links
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

// ✅ LIGHTBOX
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let lightboxImages = [];
let currentLightboxIndex = 0;

function openLightbox(images, index) {
    lightboxImages = images;
    currentLightboxIndex = index;
    lightboxImg.src = lightboxImages[currentLightboxIndex];
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}

function lightboxNext() {
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxImages.length;
    lightboxImg.src = lightboxImages[currentLightboxIndex];
}

function lightboxPrev() {
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    lightboxImg.src = lightboxImages[currentLightboxIndex];
}

document.querySelector('.lightbox .close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
});

lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') lightboxNext();
        if (e.key === 'ArrowLeft') lightboxPrev();
    }
});

document.querySelector('.lightbox-prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxPrev();
});
document.querySelector('.lightbox-next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxNext();
});

// SWIPE SUPPORT
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

// DAY CAROUSEL
class DayCarousel {
    constructor(container, dayKey, imageCount = 3) {
        this.container = container;
        this.dayKey = dayKey;
        this.imageCount = imageCount;
        this.currentSlide = 0;
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
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                openLightbox(this.imagePaths, idx);
            });
            slider.appendChild(img);
        });

        const prevBtn = document.createElement('button');
        prevBtn.className = 'day-prev';
        prevBtn.innerHTML = '‹';
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentSlide > 0) this.currentSlide--;
            this.updateSlider();
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'day-next';
        nextBtn.innerHTML = '›';
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentSlide < this.imageCount - 1) this.currentSlide++;
            this.updateSlider();
        });

        wrapper.appendChild(prevBtn);
        wrapper.appendChild(slider);
        wrapper.appendChild(nextBtn);
        this.container.innerHTML = '';
        this.container.appendChild(wrapper);

        this.sliderEl = slider;
        this.updateSlider();
        this.attachListeners(wrapper);
        addSwipeSupport(wrapper, () => this.prev(), () => this.next());
    }

    updateSlider() {
        this.sliderEl.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }

    prev() {
        if (this.currentSlide > 0) this.currentSlide--;
        this.updateSlider();
    }

    next() {
        if (this.currentSlide < this.imageCount - 1) this.currentSlide++;
        this.updateSlider();
    }

    attachListeners(wrapper) {
        wrapper.addEventListener('mouseenter', () => {});
        wrapper.addEventListener('mouseleave', () => {});
        wrapper.addEventListener('touchstart', () => {});
    }
}

// MAIN GALLERY
const totalImages = 66;
const gallerySlider = document.getElementById('gallerySlider');
gallerySlider.innerHTML = '';
for (let i = 1; i <= totalImages; i++) {
    const img = document.createElement('img');
    img.src = `images/gallery/r${i}.jpg`;
    img.alt = `Gallery Image ${i}`;
    img.addEventListener('click', () => {
        const paths = Array.from({length: totalImages}, (_, j) => `images/gallery/r${j + 1}.jpg`);
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

mainPrevBtn?.addEventListener('click', () => {
    if (mainCurrentSlide > 0) mainCurrentSlide--;
    updateMainSlider();
});

mainNextBtn?.addEventListener('click', () => {
    const visible = getMainVisibleCount();
    if (mainCurrentSlide < totalImages - visible) mainCurrentSlide++;
    updateMainSlider();
});

const galleryContainer = document.querySelector('.slider-container');
if (galleryContainer) {
    addSwipeSupport(galleryContainer, () => {
        if (mainCurrentSlide > 0) mainCurrentSlide--;
        updateMainSlider();
    }, () => {
        const visible = getMainVisibleCount();
        if (mainCurrentSlide < totalImages - visible) mainCurrentSlide++;
        updateMainSlider();
    });
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
    createBubbles('homeBubbles', 5, 7, 'home-bubble');
    createBubbles('reflectionBubbles', 5, 8, 'reflection-bubble');

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
        updateActiveNav();
    });

    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('resize', () => {
        updateMainSlider();
        updateActiveNav();
    });
});
