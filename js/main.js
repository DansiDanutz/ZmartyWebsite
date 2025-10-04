// Zmarty.me - Enhanced JavaScript with Theme System
// Smooth scrolling, animations, theme management, and interactions

// Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'dark';
        this.initTheme();
        this.bindEvents();
    }

    getStoredTheme() {
        return localStorage.getItem('zmarty-theme');
    }

    setStoredTheme(theme) {
        localStorage.setItem('zmarty-theme', theme);
    }

    initTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        const toggle = document.querySelector('#themeToggle');
        if (toggle) {
            toggle.setAttribute('aria-label', `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} theme`);
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.setStoredTheme(this.currentTheme);
        this.updateThemeToggle();
        
        // Add transition class for smooth theme change
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    }

    bindEvents() {
        const themeToggle = document.querySelector('#themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80; // Navbar height
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');

        // Animate burger icon
        const spans = mobileMenuToggle.querySelectorAll('span');
        if (mobileMenuToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(10px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-wrapper')) {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        const spans = mobileMenuToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Navbar scroll effect with theme support
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? 'rgba(10, 14, 26, 0.95)' : 'rgba(248, 250, 252, 0.95)';
    const bgColorLight = isDark ? 'rgba(10, 14, 26, 0.85)' : 'rgba(248, 250, 252, 0.85)';

    if (currentScroll > 100) {
        navbar.style.background = bgColor;
        navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = bgColorLight;
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.card, .agent-card, .blog-card, .pricing-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Counter animation for stats
const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
};

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statValues = entry.target.querySelectorAll('.stat-value');
            statValues.forEach(stat => {
                const value = stat.textContent;
                if (!isNaN(value)) {
                    animateCounter(stat, parseInt(value));
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Parallax effect for hero orbs
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const orbs = document.querySelectorAll('.gradient-orb');

    orbs.forEach((orb, index) => {
        const speed = 0.1 + (index * 0.05);
        const yPos = -(scrolled * speed);
        orb.style.transform = `translateY(${yPos}px)`;
    });
});

// Form submission handling (for future contact forms)
const handleFormSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
    console.log('Form submitted');
};

// Add subtle tilt effect to cards on mouse move
document.querySelectorAll('.card-hover').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// Add ripple effect to buttons
document.querySelectorAll('button, .btn-primary, .btn-hero-primary, .btn-hero-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple CSS
const style = document.createElement('style');
style.textContent = `
    button, .btn-primary, .btn-hero-primary, .btn-hero-secondary {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    @media (max-width: 768px) {
        .nav-links.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(15, 23, 42, 0.98);
            padding: 24px;
            gap: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
    }
`;
document.head.appendChild(style);

// Lazy load images (for future image additions)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Performance optimization: throttle scroll events
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Enhanced Reviews Animation
const initReviewsAnimation = () => {
    const reviewsContainer = document.querySelector('.reviews-scroll');
    if (!reviewsContainer) return;

    // Ensure smooth infinite scrolling
    const reviewCards = reviewsContainer.querySelectorAll('.review-card');
    const totalCards = reviewCards.length;
    
    // The current setup should work with CSS animation
    // But we can add additional enhancements
    reviewsContainer.addEventListener('animationend', () => {
        // This shouldn't fire with infinite animation, but good to have as fallback
        reviewsContainer.style.transform = 'translateX(0)';
    });

    // Optional: Add pause on individual card hover for better UX
    reviewCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            reviewsContainer.style.animationPlayState = 'paused';
        });
        
        card.addEventListener('mouseleave', () => {
            reviewsContainer.style.animationPlayState = 'running';
        });
    });
};

// Console message for developers
console.log(
    '%c🤖 Zmarty.me - Built with ❤️',
    'font-size: 20px; font-weight: bold; color: #667eea;'
);
console.log(
    '%cInterested in our AI trading platform? Check out zmarty.me',
    'font-size: 14px; color: #94a3b8;'
);

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Zmarty.me website initialized');

    // Add loaded class to body for CSS animations
    document.body.classList.add('loaded');
    
    // Initialize enhanced reviews animation
    initReviewsAnimation();
});
