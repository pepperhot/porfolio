document.addEventListener('DOMContentLoaded', () => {
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Glitch Text Animation Randomizer
    const glitchTexts = document.querySelectorAll('.glitch');
    
    setInterval(() => {
        glitchTexts.forEach(text => {
            if(Math.random() > 0.95) {
                text.style.textShadow = `
                    ${Math.random() * 10 - 5}px 0 red,
                    ${Math.random() * 10 - 5}px 0 blue
                `;
                setTimeout(() => {
                    text.style.textShadow = '2px 2px var(--secondary-color)';
                }, 50);
            }
        });
    }, 100);

    // Scroll Observer for Fade-in effects
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.project-card, .about-text').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // Console message for the "hacker" feel
    console.log('%c SYSTEM ONLINE ', 'background: #000; color: #00f3ff; font-family: monospace; font-size: 20px; padding: 10px; border: 2px solid #00f3ff;');
    console.log('Welcome to the portfolio mainframe.');

    // Modal Logic
    const modals = document.querySelectorAll('.cyber-modal');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    const closeSpans = document.querySelectorAll('.close-modal');

    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const modal = document.getElementById(targetId);
            if (modal) {
                modal.style.display = "block";
            }
        });
    });

    closeSpans.forEach(span => {
        span.addEventListener('click', () => {
            span.closest('.cyber-modal').style.display = "none";
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('cyber-modal')) {
            event.target.style.display = "none";
        }
    });
});

function openTab(evt, tabName) {
    // Hide all tab content
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName('tab-content');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    // Remove 'active' class from all buttons
    tablinks = document.getElementsByClassName('tab-btn');
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    // Show the current tab and add 'active' class
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

