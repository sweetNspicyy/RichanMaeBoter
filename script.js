// Toggle mobile menu
function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    nav.classList.toggle('active');
}

// Gallery: Load 66 images (r1.jpg to r66.jpg)
const totalImages = 66;
const gallerySlider = document.getElementById('gallerySlider');

for (let i = 1; i <= totalImages; i++) {
    const img = document.createElement('img');
    img.src = `images/gallery/r${i}.jpg`;
    img.alt = `Gallery Image ${i}`;
    img.addEventListener('click', () => openLightbox(i));
    gallerySlider.appendChild(img);
}

// Slider navigation
let currentSlide = 0;
let autoPlayInterval;
let userInteracted = false;
let inactivityTimer;

const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

function getVisibleCount() {
    if (window.innerWidth <= 820) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

function updateSlider() {
    const visible = getVisibleCount();
    const maxSlide = totalImages - visible;
    if (currentSlide > maxSlide) currentSlide = maxSlide;
    const translateX = -currentSlide * (gallerySlider.children[0]?.offsetWidth + 10);
    gallerySlider.style.transform = `translateX(${translateX}px)`;
}

// Interaction tracker
function onUserInteraction() {
    userInteracted = true;
    resetAutoPlay();
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    clearTimeout(inactivityTimer);

    // Resume after 10s of inactivity
    inactivityTimer = setTimeout(() => {
        userInteracted = false;
        startAutoPlay();
    }, 10000);
}

function startAutoPlay() {
    if (userInteracted) return;
    autoPlayInterval = setInterval(() => {
        const visible = getVisibleCount();
        if (currentSlide < totalImages - visible) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        updateSlider();
    }, 4000);
}

// Event listeners
prevBtn.addEventListener('click', () => {
    if (currentSlide > 0) currentSlide--;
    updateSlider();
    onUserInteraction();
});

nextBtn.addEventListener('click', () => {
    const visible = getVisibleCount();
    if (currentSlide < totalImages - visible) currentSlide++;
    updateSlider();
    onUserInteraction();
});

// Touch swipe support (optional but recommended for mobile)
let startX = 0;
gallerySlider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
});

gallerySlider.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            // Swipe left → next
            const visible = getVisibleCount();
            if (currentSlide < totalImages - visible) currentSlide++;
        } else {
            // Swipe right → prev
            if (currentSlide > 0) currentSlide--;
        }
        updateSlider();
        onUserInteraction();
    }
});

// Hover (desktop only)
gallerySlider.addEventListener('mouseenter', onUserInteraction);
gallerySlider.addEventListener('mouseleave', () => {
    if (!userInteracted) return;
    resetAutoPlay();
});

// Start auto-play on load
window.addEventListener('load', () => {
    updateSlider();
    startAutoPlay();
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let currentLightbox = 1;

function openLightbox(index) {
    currentLightbox = index;
    lightboxImg.src = `images/gallery/r${currentLightbox}.jpg`;
    lightbox.style.display = 'flex';
    onUserInteraction(); // Pause gallery during lightbox
}

function closeLightbox() {
    lightbox.style.display = 'none';
}

function lightboxNext() {
    currentLightbox = currentLightbox < totalImages ? currentLightbox + 1 : 1;
    lightboxImg.src = `images/gallery/r${currentLightbox}.jpg`;
}

function lightboxPrev() {
    currentLightbox = currentLightbox > 1 ? currentLightbox - 1 : totalImages;
    lightboxImg.src = `images/gallery/r${currentLightbox}.jpg`;
}

// Lightbox controls
document.querySelector('.lightbox .close').addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', lightboxPrev);
document.querySelector('.lightbox-next').addEventListener('click', lightboxNext);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') lightboxNext();
        if (e.key === 'ArrowLeft') lightboxPrev();
    }
});
