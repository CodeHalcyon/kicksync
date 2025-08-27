document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;

    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        darkModeToggle.classList.add('active');
    }

    darkModeToggle.addEventListener('click', () => {
        const isDark = htmlElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        darkModeToggle.classList.toggle('active', !isDark);
        // Re-render 3D scene if colors are theme-dependent (e.g., background)
        if (typeof update3DSceneColors === 'function') {
            update3DSceneColors();
        }
    });

    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');

    mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    });

    const closeMenu = () => {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        document.body.style.overflow = '';
    };

    closeMobileMenu.addEventListener('click', closeMenu);
    mobileMenuLinks.forEach(link => link.addEventListener('click', closeMenu));

    // Collections Dropdown Logic
    const collectionsDropdownToggle = document.getElementById('collectionsDropdownToggle');
    const collectionsDropdownMenu = document.getElementById('collectionsDropdownMenu');
    const collectionsDropdownParent = collectionsDropdownToggle.closest('.group');

    let dropdownOpen = false;

    function toggleDropdown() {
        dropdownOpen = !dropdownOpen;
        collectionsDropdownToggle.setAttribute('aria-expanded', dropdownOpen);
        collectionsDropdownParent.classList.toggle('dropdown-open', dropdownOpen);

        if (dropdownOpen) {
            collectionsDropdownMenu.classList.remove('hidden');
            gsap.to(collectionsDropdownMenu, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', onComplete: () => {
                collectionsDropdownMenu.style.pointerEvents = 'auto';
            }});
        } else {
            gsap.to(collectionsDropdownMenu, { opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in', onComplete: () => {
                collectionsDropdownMenu.classList.add('hidden');
                collectionsDropdownMenu.style.pointerEvents = 'none';
            }});
        }
    }

    collectionsDropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggleDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (dropdownOpen && !collectionsDropdownParent.contains(e.target)) {
            toggleDropdown();
        }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdownOpen) {
            toggleDropdown();
            collectionsDropdownToggle.focus(); // Return focus to the toggle button
        }
    });

    // GSAP Animations

    // Wrap the existing page load animation in a function
    function startMainPageLoadAnimation() {
        gsap.timeline({ delay: 0.3 }) // Slight delay for initial render
            .from('.hero-bg-image', { opacity: 0, scale: 1.05, duration: 1.5, ease: 'power3.out' }, 0)
            .from('.hero-overlay', { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0.3)
            .from('.hero-content-block', { opacity: 0, x: -80, duration: 1.2, ease: 'power3.out' }, 0.6)
            .from('.hero-headline-line', { opacity: 0, y: 50, stagger: 0.2, duration: 1, ease: 'back.out(1.2)' }, 1)
            .from('.hero-subheadline', { opacity: 0, y: 30, duration: 0.9, ease: 'power2.out' }, 1.5)
            .from('.hero-cta-group a', { opacity: 0, y: 20, stagger: 0.2, duration: 0.8, ease: 'back.out(1.7)' }, 1.8)
            .from('.hero-secondary-image', { opacity: 0, scale: 0.9, rotation: -5, duration: 1, ease: 'power2.out' }, 1.2)
            .from('.logo-text', { opacity: 0, x: -30, duration: 0.7, ease: 'power2.out' }, 1.8)
            .from('.nav-link', { opacity: 0, y: -15, stagger: 0.15, duration: 0.6, ease: 'power2.out' }, 2)
            .from('#darkModeToggle, [aria-label="Open shopping cart"]', { opacity: 0, x: 25, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, 2);
    }

    // Preloader Animation (New)
    const preloader = document.getElementById('preloader');
    const glitchText = document.getElementById('glitchText');
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');

    // Set data-text attribute for glitch effect (used by CSS pseudo-elements)
    glitchText.setAttribute('data-text', glitchText.textContent);

    document.body.style.overflow = 'hidden'; // Hide body overflow initially

    const preloaderTimeline = gsap.timeline({
        delay: 0.5, // Small initial delay before preloader animation starts
        onUpdate: () => {
            // Update percentage text
            const progress = Math.round(progressBar.offsetWidth / progressBar.parentElement.offsetWidth * 100);
            progressPercentage.textContent = `${progress}%`;
        },
        onComplete: () => {
            gsap.to(preloader, {
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => {
                    preloader.style.display = 'none';
                    document.body.style.overflow = ''; // Re-enable scrolling
                    startMainPageLoadAnimation(); // Start the main page load animation
                    init3D(); // Initialize 3D scene after preloader
                    animate3D(); // Start 3D animation loop
                }
            });
        }
    });

    preloaderTimeline
        .from(glitchText, { opacity: 0, y: -20, duration: 0.8, ease: 'power3.out' })
        .from([progressBar.parentElement, progressPercentage], { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, "<0.2")
        .to(progressBar, {
            width: '100%',
            duration: 2.5, // Duration for the progress bar fill
            ease: 'power2.inOut'
        }, ">0.2"); // Start after glitch text and bar container appear

    // Header Scroll Animation
    const mainHeader = document.getElementById('mainHeader');
    ScrollTrigger.create({
        trigger: 'body',
        start: 'top -100px', // When scrolled 100px down
        end: 'max',
        toggleClass: {
            targets: mainHeader,
            className: 'header-scrolled-state'
        },
        // markers: true // Uncomment for debugging
    });

    // Scroll-triggered animations for sections
    gsap.utils.toArray('.scroll-reveal').forEach(element => {
        gsap.from(element, {
            opacity: 0,
            y: 70,
            rotationZ: () => gsap.utils.random(-3, 3), // Subtle random rotation for funky feel
            scale: 0.95,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: element,
                start: 'top 85%', 
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
                // markers: true, 
            }
        });
    });

    // GSAP for Abstract Pattern Elements
    gsap.utils.toArray('.abstract-pattern-element').forEach((element, i) => {
        gsap.from(element, {
            opacity: 0,
            scale: 1.2, // Start larger
            rotation: () => gsap.utils.random(-15, 15), // More rotation for abstract feel
            duration: 1.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: element.closest('section'), // Trigger when its parent section enters view
                start: 'top 85%',
                end: 'bottom 15%',
                toggleActions: 'play none none reverse',
                // markers: true,
            }
        });
    });

    // Product Card Hover Animation (GSAP controlled) - UPDATED FOR USER REQUEST
    document.querySelectorAll('.product-card').forEach(card => {
        const image = card.querySelector('.product-image');
        const title = card.querySelector('.product-title');
        const price = card.querySelector('.product-card > a > span');
        const addToCartBtn = card.querySelector('.product-card > button');
        const detailsExpanded = card.querySelector('.product-details-expanded');

        // Store original z-index and rotation for reset
        const originalZIndex = card.style.zIndex || '1';
        // Get initial rotation from computed style, as it's set by Tailwind classes
        const computedStyle = window.getComputedStyle(card);
        const transformMatrix = computedStyle.getPropertyValue('transform');
        let originalRotation = 0;
        if (transformMatrix && transformMatrix !== 'none') {
            const matrixValues = transformMatrix.match(/matrix\(([^)]+)\)/);
            if (matrixValues) {
                const values = matrixValues[1].split(', ').map(Number);
                const a = values[0];
                const b = values[1];
                originalRotation = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            }
        }

        // Initial state for expanded details (hidden)
        gsap.set(detailsExpanded, { height: 0, autoAlpha: 0, overflow: 'hidden' });

        card.addEventListener('mouseenter', () => {
            gsap.timeline({ overwrite: true })
                .to(card, {
                    scale: 1.08, // Slightly larger scale for the hovered card
                    scaleX: 1.05, // Emphasize width increase
                    zIndex: 10, // Bring to front
                    rotationZ: 0, // Straighten the card
                    boxShadow: '0 15px 30px rgba(0,0,0,0.3)', // Enhanced shadow
                    duration: 0.3,
                    ease: 'power2.out'
                })
                .to(image, { scale: 1.02, duration: 0.3 }, "<")
                .to(title, { color: 'var(--color-accent-500)', duration: 0.3 }, "<")
                .to(price, { scale: 1.1, duration: 0.3 }, "<")
                .to(addToCartBtn, { y: -5, scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.3)', duration: 0.3 }, "<")
                .to(detailsExpanded, { height: 'auto', autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, "<0.1");

            // Siblings animation: make them recede and straighten
            const siblings = Array.from(card.parentElement.children).filter(el => el !== card && el.classList.contains('product-card'));
            gsap.to(siblings, { opacity: 0.4, scale: 0.9, rotationZ: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
        });

        card.addEventListener('mouseleave', () => {
            gsap.timeline({ overwrite: true })
                .to(card, {
                    scale: 1,
                    scaleX: 1,
                    zIndex: originalZIndex, // Reset z-index
                    rotationZ: originalRotation, // Revert to original rotation
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', // Revert shadow
                    duration: 0.3,
                    ease: 'power2.out'
                })
                .to(image, { scale: 1, duration: 0.3 }, "<")
                .to(title, { color: 'var(--color-text)', duration: 0.3 }, "<")
                .to(price, { scale: 1, duration: 0.3 }, "<")
                .to(addToCartBtn, { y: 0, scale: 1, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', duration: 0.3 }, "<")
                .to(detailsExpanded, { height: 0, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, "<0.1");

            // Siblings reset
            const siblings = Array.from(card.parentElement.children).filter(el => el !== card && el.classList.contains('product-card'));
            gsap.to(siblings, { opacity: 1, scale: 1, rotationZ: originalRotation, duration: 0.3, ease: 'power2.out', overwrite: true });
        });
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                gsap.to(window, { 
                    duration: 1,
                    scrollTo: {
                        y: targetElement.offsetTop - 80, 
                        autoKill: false
                    },
                    ease: 'power2.inOut'
                });
            }
        });
    });

    // Three.js 3D Model Integration
    let scene, camera, renderer, controls, model;
    const loading3DOverlay = document.getElementById('loading3D');

    function init3D() {
        const container = document.getElementById('threeJsCanvas');
        if (!container || typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined' || typeof THREE.OrbitControls === 'undefined') {
            console.error('Three.js or its components are not loaded, or canvas container not found.');
            loading3DOverlay.textContent = '3D model functionality unavailable.';
            return;
        }

        // Scene
        scene = new THREE.Scene();
        // Set background to transparent or match theme dynamically
        const getSurfaceColor = () => {
            const style = getComputedStyle(document.documentElement);
            return style.getPropertyValue('--color-surface').trim();
        };
        const initialSurfaceColor = getSurfaceColor();
        scene.background = new THREE.Color(initialSurfaceColor);

        // Camera
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 2);

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Soft white light
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Brighter directional light
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-1, -1, -1).normalize();
        scene.add(fillLight);

        // Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // An animation loop is required when damping is enabled
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 1;
        controls.maxDistance = 5;
        controls.enablePan = false; // Disable panning for a shoe model
        controls.target.set(0, 0, 0); // Ensure target is centered

        // GLTF Loader
        const loader = new THREE.GLTFLoader();
        // Using a sneaker model from KhronosGroup samples
        loader.load(
            'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Sneaker/glTF/Sneaker.gltf', 
            (gltf) => {
                model = gltf.scene;
                model.scale.set(100, 100, 100); // Adjust scale for the sneaker model
                model.position.set(0, -0.5, 0); // Adjust position to center the shoe
                scene.add(model);
                loading3DOverlay.style.display = 'none'; // Hide loading overlay
                console.log('3D Sneaker Model loaded successfully!');
            },
            (xhr) => {
                // Optional: Progress callback
                const progress = (xhr.loaded / xhr.total * 100);
                // console.log(progress + '% loaded');
                // You could update a progress bar here if needed
            },
            (error) => {
                console.error('An error occurred while loading the 3D model:', error);
                loading3DOverlay.textContent = 'Failed to load 3D model.';
            }
        );

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        const container = document.getElementById('threeJsCanvas');
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate3D() {
        requestAnimationFrame(animate3D);
        if (controls) controls.update(); // Only update controls if they exist
        if (renderer && scene && camera) renderer.render(scene, camera);
    }

    // Function to update 3D scene background color based on theme
    window.update3DSceneColors = () => {
        if (scene) {
            const style = getComputedStyle(document.documentElement);
            const surfaceColor = style.getPropertyValue('--color-surface').trim();
            scene.background = new THREE.Color(surfaceColor);
        }
    };

    // FAQ Accordion Logic
    document.querySelectorAll('.faq-item button').forEach(button => {
        const answer = button.nextElementSibling;
        const icon = button.querySelector('svg');

        // Initialize state for GSAP
        gsap.set(answer, { height: 0, autoAlpha: 0, overflow: 'hidden' });

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                // Collapse
                gsap.to(answer, { height: 0, autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' });
                button.setAttribute('aria-expanded', 'false');
                gsap.to(icon, { rotation: 0, duration: 0.3 });
            } else {
                // Expand - first collapse any other open accordions
                document.querySelectorAll('.faq-item button[aria-expanded="true"]').forEach(openButton => {
                    if (openButton !== button) {
                        const openAnswer = openButton.nextElementSibling;
                        const openIcon = openButton.querySelector('svg');
                        gsap.to(openAnswer, { height: 0, autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' });
                        openButton.setAttribute('aria-expanded', 'false');
                        gsap.to(openIcon, { rotation: 0, duration: 0.3 });
                    }
                });

                // Expand current
                gsap.to(answer, { height: 'auto', autoAlpha: 1, duration: 0.5, ease: 'power2.inOut' });
                button.setAttribute('aria-expanded', 'true');
                gsap.to(icon, { rotation: 180, duration: 0.3 });
            }
        });
    });

    // Scroll to Top Button Logic
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    gsap.to(scrollToTopBtn, { 
        opacity: 1, 
        y: 0, 
        pointerEvents: 'auto', 
        duration: 0.5, 
        ease: 'power2.out', 
        scrollTrigger: {
            trigger: 'body',
            start: 'top -500px', // Show button after scrolling 500px down
            end: 'max', // Keep it visible until the end
            toggleActions: 'play none none reverse',
            // markers: true,
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        gsap.to(window, { duration: 1.5, scrollTo: 0, ease: 'power3.inOut' });
    });
});
