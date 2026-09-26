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

    // ============ STATS LIVE (chargé uniquement si la section existe) ============
    if (document.getElementById('stats')) {
        loadStats();
    }
});

async function loadStats() {
    try {
        const res = await fetch('data.json?_=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        // GitHub
        if (data.github) {
            setText('gh-repos',     data.github.public_repos);
            setText('gh-stars',     data.github.stars);
            setText('gh-followers', data.github.followers);

            const langBox = document.querySelector('[data-k="gh-langs"]');
            if (langBox && Array.isArray(data.github.languages)) {
                langBox.innerHTML = data.github.languages
                    .map(l => `<span class="lang-chip">${escapeHtml(l.name)}</span>`)
                    .join('');
            }

            const latestEl = document.querySelector('[data-k="gh-latest"]');
            if (latestEl && data.github.latest) {
                const when = data.github.latest.updated
                    ? new Date(data.github.latest.updated).toLocaleDateString('fr-FR')
                    : '';
                latestEl.innerHTML = `Dernier repo : <a class="stat-link" href="${escapeAttr(data.github.latest.url)}" target="_blank" rel="noopener">${escapeHtml(data.github.latest.name)}</a> ${when ? '· ' + when : ''}`;
            }
        }

        // HTB
        if (data.htb) {
            setText('htb-user',       data.htb.user);
            setText('htb-rank',       data.htb.rank);
            const levelTxt = data.htb.level_xp
                ? `${data.htb.level} (${data.htb.level_xp})`
                : data.htb.level;
            setText('htb-level',      levelTxt);
            setText('htb-user-owns',  data.htb.user_owns);
            setText('htb-sys-owns',   data.htb.system_owns);
            setText('htb-sherlocks',  data.htb.sherlocks);
            setText('htb-challenges', data.htb.challenges);

            const recentEl = document.querySelector('[data-k="htb-recent"]');
            if (recentEl && Array.isArray(data.htb.recent) && data.htb.recent.length) {
                recentEl.textContent = 'Dernières machines : ' + data.htb.recent.join(', ');
            }
        }

        // Root-Me
        if (data.rootme) {
            setText('rm-user',       data.rootme.user);
            setText('rm-points',     data.rootme.points);
            setText('rm-challenges', data.rootme.challenges);
            setText('rm-place',      data.rootme.place ? '#' + data.rootme.place.toLocaleString('fr-FR') : '—');

            const catBox = document.querySelector('[data-k="rm-categories"]');
            if (catBox && Array.isArray(data.rootme.categories)) {
                catBox.innerHTML = data.rootme.categories.slice(0, 5)
                    .map(c => `<span class="lang-chip" title="${escapeAttr(c.solved + '/' + c.total)}">${escapeHtml(c.name)} · ${c.points}pt</span>`)
                    .join('');
            }
        }

        // Timestamp
        if (data.updated_at) {
            const d = new Date(data.updated_at);
            const el = document.getElementById('updated-at');
            if (el) el.textContent = d.toLocaleString('fr-FR', {
                dateStyle: 'medium', timeStyle: 'short'
            });
        }
    } catch (e) {
        console.warn('[stats] impossible de charger data.json :', e);
        const el = document.getElementById('updated-at');
        if (el) el.textContent = '⚠ stats indisponibles';
    }
}

function setText(key, value) {
    const el = document.querySelector(`[data-k="${key}"]`);
    if (el && value !== undefined && value !== null) el.textContent = value;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}
function escapeAttr(s) { return escapeHtml(s); }

function openTab(evt, tabName) {
    // Find the parent modal content to scope the query
    var modalContent = evt.currentTarget.closest('.modal-content');
    var context = modalContent || document;

    // Hide all tab content within this modal
    var tabcontent = context.getElementsByClassName('tab-content');
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    // Remove 'active' class from all buttons within this modal
    var tablinks = context.getElementsByClassName('tab-btn');
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    // Show the current tab and add 'active' class
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

