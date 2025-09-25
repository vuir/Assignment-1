// ===========================
// Portfolio Website JavaScript
// ===========================

(function() {
    'use strict';

    // DOM Elements
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const currentYear = document.getElementById('current-year');

    // State
    let isMenuOpen = false;
    let currentSection = 'home';

    // ===========================
    // Utility Functions
    // ===========================

    /**
     * Debounce function to limit the rate at which a function can fire
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get element's offset from top of page
     */
    function getOffsetTop(element) {
        const rect = element.getBoundingClientRect();
        return rect.top + window.pageYOffset;
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element, threshold = 0.3) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;

        return (
            elementTop <= windowHeight * (1 - threshold) &&
            elementBottom >= windowHeight * threshold
        );
    }

    // ===========================
    // Navigation Functions
    // ===========================

    /**
     * Toggle mobile navigation menu
     */
    function toggleMobileMenu() {
        isMenuOpen = !isMenuOpen;

        navToggle.classList.toggle('active', isMenuOpen);
        navMenu.classList.toggle('active', isMenuOpen);

        // Update ARIA attributes for accessibility
        navToggle.setAttribute('aria-expanded', isMenuOpen);
        navMenu.setAttribute('aria-hidden', !isMenuOpen);

        // Prevent body scroll when menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    /**
     * Close mobile menu
     */
    function closeMobileMenu() {
        if (isMenuOpen) {
            toggleMobileMenu();
        }
    }

    /**
     * Handle navigation link clicks
     */
    function handleNavLinkClick(e) {
        e.preventDefault();

        const href = e.target.getAttribute('href');
        const targetSection = href.substring(1); // Remove '#'

        // Close mobile menu if open
        closeMobileMenu();

        // Smooth scroll to section
        scrollToSection(targetSection);

        // Update active link
        setActiveNavLink(targetSection);
    }

    /**
     * Smooth scroll to section
     */
    function scrollToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (!targetElement) return;

        const targetPosition = getOffsetTop(targetElement) - navbar.offsetHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Update active navigation link based on current section
     */
    function setActiveNavLink(sectionId) {
        currentSection = sectionId;

        navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Scroll spy - update active nav link based on scroll position
     */
    function updateActiveNavLink() {
        const sections = ['home', 'about', 'skills', 'projects', 'contact'];
        const scrollPosition = window.pageYOffset + navbar.offsetHeight + 100;

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section && getOffsetTop(section) <= scrollPosition) {
                if (currentSection !== sections[i]) {
                    setActiveNavLink(sections[i]);
                }
                break;
            }
        }
    }

    // ===========================
    // Form Validation Functions
    // ===========================

    /**
     * Validate form field
     */
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        const errorElement = document.getElementById(`${fieldName}-error`);

        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }

        // Name validation
        if (fieldName === 'name' && value) {
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters long';
            }
        }

        // Email validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Message validation
        if (fieldName === 'message' && value) {
            if (value.length < 5) {
                isValid = false;
                errorMessage = 'Message must be at least 5 characters long';
            }
        }

        // Update field styling and error message
        field.classList.toggle('error', !isValid);
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.setAttribute('aria-live', isValid ? 'off' : 'polite');
        }

        return isValid;
    }

    /**
     * Show form status message
     */
    function showFormStatus(message, type = 'error') {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.setAttribute('aria-live', 'polite');

        // Auto-hide success message after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formStatus.textContent = '';
                formStatus.className = 'form-status';
            }, 5000);
        }
    }

    /**
     * Handle form submission
     */
    async function handleFormSubmit(e) {
        e.preventDefault();

        // Validate all fields
        const formFields = contactForm.querySelectorAll('.form-input');
        let isFormValid = true;
        let firstInvalidField = null;

        formFields.forEach(field => {
            const isFieldValid = validateField(field);
            if (!isFieldValid && !firstInvalidField) {
                firstInvalidField = field;
            }
            isFormValid = isFormValid && isFieldValid;
        });

        // Focus first invalid field
        if (firstInvalidField) {
            firstInvalidField.focus();
            showFormStatus('Please fix the highlighted fields');
            return;
        }

        // If form is valid, submit to Formspree
        if (isFormValid) {
            try {
                // Show loading state
                const submitBtn = contactForm.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                // Prepare form data
                const formData = new FormData(contactForm);

                // Submit to Formspree
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    showFormStatus('Thank you! Your message has been sent successfully.', 'success');

                    // Reset form after successful submission
                    setTimeout(() => {
                        contactForm.reset();
                        // Clear any error states
                        formFields.forEach(field => {
                            field.classList.remove('error');
                            const errorElement = document.getElementById(`${field.name}-error`);
                            if (errorElement) {
                                errorElement.textContent = '';
                            }
                        });
                    }, 1000);
                } else {
                    throw new Error('Form submission failed');
                }

            } catch (error) {
                console.error('Form submission error:', error);
                showFormStatus('Oops! There was a problem sending your message. Please try again.', 'error');
            } finally {
                // Reset button state
                const submitBtn = contactForm.querySelector('.submit-btn');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    // ===========================
    // Event Listeners
    // ===========================

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        // Navigation toggle
        navToggle.addEventListener('click', toggleMobileMenu);

        // Navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !navbar.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Handle escape key to close mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMobileMenu();
            }
        });

        // Form submission
        contactForm.addEventListener('submit', handleFormSubmit);

        // Form field validation on blur
        contactForm.querySelectorAll('.form-input').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                // Clear error state on input
                if (field.classList.contains('error')) {
                    validateField(field);
                }
            });
        });

        // Scroll event for scroll spy
        window.addEventListener('scroll', debounce(updateActiveNavLink, 100));

        // Resize event to handle mobile menu
        window.addEventListener('resize', () => {
            if (window.innerWidth > 860 && isMenuOpen) {
                closeMobileMenu();
            }
        });
    }

    // ===========================
    // Initialize Functions
    // ===========================

    /**
     * Update footer year
     */
    function updateFooterYear() {
        const year = new Date().getFullYear();
        if (currentYear) {
            currentYear.textContent = year;
        }
    }

    /**
     * Add loading animation to skill icons
     */
    function initSkillAnimations() {
        const skillItems = document.querySelectorAll('.skill-item');

        // Intersection Observer for skill animations
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        skillItems.forEach((item, index) => {
            // Initial state for animation
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;

            skillObserver.observe(item);
        });
    }

    /**
     * Add loading animation to project cards
     */
    function initProjectAnimations() {
        const projectCards = document.querySelectorAll('.project-card');

        const projectObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });

        projectCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;

            projectObserver.observe(card);
        });
    }

    /**
     * Initialize the application
     */
    function init() {
        // Update footer year
        updateFooterYear();

        // Initialize event listeners
        initEventListeners();

        // Initialize animations
        initSkillAnimations();
        initProjectAnimations();

        // Set initial active nav link
        setActiveNavLink('home');

        // Add loaded class to body for any CSS animations
        document.body.classList.add('loaded');

        console.log('Portfolio website initialized successfully!');
    }

    // ===========================
    // Initialize on DOM Load
    // ===========================

    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
