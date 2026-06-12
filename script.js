document.addEventListener('DOMContentLoaded', () => {

    // --- 1. THEME SWITCHER ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Check local storage or system preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
    } else if (!currentTheme && window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.body.classList.add('light-mode');
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        // Update neural network canvas colors immediately on toggle
        initCanvasColors();
    });


    // --- 2. NEURAL NETWORK CANVAS ANIMATION ---
    const canvas = document.getElementById('neural-canvas');
    const ctx = canvas.getContext('2d');
    
    let nodes = [];
    const maxNodes = 60;
    const connectionDist = 130;
    let dotColor = 'rgba(0, 102, 204, 0.45)';
    let lineColor = 'rgba(0, 102, 204, 0.08)';
    let accentDotColor = 'rgba(123, 74, 226, 0.45)';
    let mouse = { x: null, y: null, radius: 150 };

    function initCanvasColors() {
        const isLight = document.body.classList.contains('light-mode');
        if (isLight) {
            dotColor = 'rgba(0, 102, 204, 0.35)';
            lineColor = 'rgba(0, 102, 204, 0.06)';
            accentDotColor = 'rgba(123, 74, 226, 0.35)';
        } else {
            dotColor = 'rgba(0, 102, 204, 0.45)';
            lineColor = 'rgba(0, 102, 204, 0.08)';
            accentDotColor = 'rgba(123, 74, 226, 0.45)';
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initNodes();
    }

    class Node {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1.5;
            this.isAccent = Math.random() > 0.7;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Mouse interaction (push away slightly)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x += (dx / dist) * force * 1.5;
                    this.y += (dy / dist) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.isAccent ? accentDotColor : dotColor;
            ctx.fill();
        }
    }

    function initNodes() {
        nodes = [];
        const count = Math.min(maxNodes, Math.floor((canvas.width * canvas.height) / 25000));
        for (let i = 0; i < count; i++) {
            nodes.push(new Node());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw nodes
        nodes.forEach(node => {
            node.update();
            node.draw();
        });

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    // Fade lines out as they get farther apart
                    const alpha = (1 - dist / connectionDist);
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = lineColor.replace('0.08', (alpha * 0.1).toString()).replace('0.06', (alpha * 0.08).toString());
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // Event listeners for canvas
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    initCanvasColors();
    resizeCanvas();
    animate();


    // --- 3. DYNAMIC TYPING ANIMATION ---
    const words = ["AIML Student", "Embedded Developer", "IoT Tech Innovator", "Problem Solver"];
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const typedTextEl = document.getElementById('typed-text');
    let typingSpeed = 100;

    function type() {
        const currentWord = words[wordIdx];
        
        if (isDeleting) {
            typedTextEl.textContent = currentWord.substring(0, charIdx - 1);
            charIdx--;
            typingSpeed = 50;
        } else {
            typedTextEl.textContent = currentWord.substring(0, charIdx + 1);
            charIdx++;
            typingSpeed = 120;
        }

        if (!isDeleting && charIdx === currentWord.length) {
            typingSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            typingSpeed = 300; // Pause before starting new word
        }

        setTimeout(type, typingSpeed);
    }

    if (typedTextEl) {
        setTimeout(type, 1000);
    }


    // --- 4. PROJECT FILTERING ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and add to this one
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Set transition layout styles dynamically
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px) scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300); // match standard transitions
                }
            });
        });
    });


    // --- 5. SCROLL REVEAL (INTERSECTION OBSERVER) ---
    const reveals = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's the skills section, animate the progress bars
                if (entry.target.id === 'skills') {
                    animateSkills();
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    function animateSkills() {
        const skillProgressBars = document.querySelectorAll('.skill-progress');
        skillProgressBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
        });
    }


    // --- 6. CONTACT FORM SUCCESS HANDLER ---
    const contactForm = document.getElementById('contact-form');
    const formSuccessEl = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show success message and clear form inputs
            formSuccessEl.style.display = 'block';
            contactForm.reset();
            
            // Auto hide success message after 5 seconds
            setTimeout(() => {
                formSuccessEl.style.display = 'none';
            }, 5000);
        });
    }
});
