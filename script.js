// ==========================================
// Custom Cursor & Hover Effects
// ==========================================
const cursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Expand cursor on clickable elements
const clickables = document.querySelectorAll('a, button, input, .project-card, .social-card');
clickables.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});

// ==========================================
// Scroll Reveal & Progress Bar
// ==========================================
const scrollProgress = document.getElementById('scroll-progress');

document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, { root: null, threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    reveals.forEach(reveal => revealObserver.observe(reveal));

    // Navbar Scroll & Progress
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        // Navbar
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        // Progress bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + "%";
    });
});

// ==========================================
// Interactive Terminal
// ==========================================
const terminalInput = document.getElementById('terminal-input');
const terminalBody = document.getElementById('terminal-body');

const commands = {
    'help': 'Available commands: about, skills, projects, clear',
    'about': 'Vipul Bajaj. Double Major EE & CSE from IIT Kanpur. Builder of intelligent systems.',
    'skills': 'Python, C++, Machine Learning, NLP, Django, React, Next.js',
    'projects': 'SaveAtlas, changiAI, myKatalyst, Mapped-gram, ThreadLens, acadAI.',
    'whoami': 'guest_user_9000'
};

if(terminalInput) {
    terminalInput.addEventListener('keydown', function(e) {
        if(e.key === 'Enter') {
            const val = this.value.trim().toLowerCase();
            if(val) {
                // Echo command
                const cmdLine = document.createElement('p');
                cmdLine.innerHTML = `<span class="prompt">vipul@system:~$</span> ${val}`;
                terminalBody.insertBefore(cmdLine, this.parentElement);

                // Process command
                if(val === 'clear') {
                    const msgs = terminalBody.querySelectorAll('p');
                    msgs.forEach(p => p.remove());
                } else {
                    const response = document.createElement('p');
                    response.style.color = 'var(--text-secondary)';
                    response.textContent = commands[val] || `Command not found: ${val}. Type 'help' for available commands.`;
                    terminalBody.insertBefore(response, this.parentElement);
                }
            }
            this.value = '';
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    });
}

// ==========================================
// Interactive Particle Network Background
// ==========================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 70; // Optimized for performance
const connectionDistance = 150;
const mouse = { x: null, y: null, radius: 200 };

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', () => { resize(); initParticles(); });
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.baseSize = Math.random() * 2 + 1;
        this.size = this.baseSize;
        const isIndigo = Math.random() > 0.5;
        this.color = isIndigo ? 'rgba(79, 70, 229, 0.4)' : 'rgba(236, 72, 153, 0.4)';
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                this.x -= forceDirectionX * force * 2;
                this.y -= forceDirectionY * force * 2;
            }
        }
        this.draw();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
}

function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < connectionDistance) {
                let opacity = 1 - (distance / connectionDistance);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) particles[i].update();
    connectParticles();
}

resize(); initParticles(); animate();
