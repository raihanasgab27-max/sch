const classes = [
    { name: "VII BRUNEI DARUSSALAM", folder: "VII_BRUNEI_DARUSSALAM", wali: "Ust. Akmal Fauzi, M.Pd", level: "VII" },
    { name: "VII MALAYSIA", folder: "VII_MALAYSIA", wali: "Ust. Muhammad Kholis, M.Pd", level: "VII" },
    { name: "VII YORDANIA", folder: "VII_YORDANIA", wali: "Ustzh. Dara Mauliza, S.Pd", level: "VII" },
    { name: "VII TUNISIA", folder: "VII_TUNISIA", wali: "Ustzh. Yuliani Mutia Wahna, S.Pd", level: "VII" },
    { name: "VIII QATAR", folder: "VIII_QATAR", wali: "Ust. Muhammad Ramadan, S.Ag", level: "VIII" },
    { name: "VIII PALESTINA", folder: "VIII_PALESTINA", wali: "Ust. Maryono, S.Pd", level: "VIII" },
    { name: "VIII EGYPT", folder: "VIII_EGYPT", wali: "Ustzh. Marlina Sukmawati, LC", level: "VIII" },
    { name: "VIII INDONESIA", folder: "VIII_INDONESIA", wali: "Ustzh. Rahmadani Mamina, SE", level: "VIII" },
    { name: "IX MAROKO", folder: "IX_MAROKO", wali: "Ust. Rahmad Hidayat, M.Pd", level: "IX" },
    { name: "IX UNI EMIRATE ARAB", folder: "IX_UNI_EMIRATE_ARAB", wali: "Ustzh. Rika Dara Yanti, S.Kom", level: "IX" },
    { name: "IX TURKI", folder: "IX_TURKI", wali: "Ustzh. Derliani Daulay, M.Pd", level: "IX" },
];

const DAYS = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

let scheduleCache = {};

function getCurrentDay() {
    return DAYS[new Date().getDay()];
}

function timeToMinutes(t) {
    const [h, m] = t.split('.').map(Number);
    return h * 60 + m;
}

function getCurrentLesson(scheduleData) {
    const day = getCurrentDay();
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const daySchedule = scheduleData.schedule[day];
    if (!daySchedule) return null;

    for (const event of daySchedule) {
        const [start, end] = event.waktu.split(' - ').map(timeToMinutes);
        if (nowMinutes >= start && nowMinutes < end) {
            return {
                subject: event.subject,
                waktu: event.waktu,
                type: event.type,
                kode: event.kode
            };
        }
    }

    return null;
}

async function loadClassSchedule(folder) {
    const resp = await fetch(`${folder}/script.js`);
    const text = await resp.text();

    const start = text.indexOf('const scheduleData = ');
    if (start === -1) return null;

    const objStart = text.indexOf('{', start);
    if (objStart === -1) return null;

    let depth = 0;
    let objEnd = objStart;
    for (let i = objStart; i < text.length; i++) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') {
            depth--;
            if (depth === 0) {
                objEnd = i + 1;
                break;
            }
        }
    }

    let jsonStr = text.substring(objStart, objEnd);
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        return null;
    }
}

function getAccent(level) {
    if (level === 'VII') return 'vii';
    if (level === 'VIII') return 'viii';
    return 'ix';
}

function renderClasses(filter = '') {
    const grid = document.getElementById('class-grid');
    const q = filter.toLowerCase().trim();

    const filtered = classes.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.wali.toLowerCase().includes(q) ||
        c.level.toLowerCase().includes(q)
    );

    grid.innerHTML = filtered.map(c => {
        const acc = getAccent(c.level);
        const data = scheduleCache[c.folder];
        const lesson = data ? getCurrentLesson(data) : null;

        let nowHtml = '';
        if (lesson) {
            if (lesson.type === 'class') {
                nowHtml = `<div class="item-now now-active">
                    <span class="now-dot"></span>
                    <span class="now-subject">${lesson.subject}</span>
                    <span class="now-time">${lesson.waktu}</span>
                </div>`;
            } else if (lesson.type === 'break') {
                nowHtml = `<div class="item-now now-break">
                    <span class="now-dot"></span>
                    <span>${lesson.subject}</span>
                    <span class="now-time">${lesson.waktu}</span>
                </div>`;
            } else {
                nowHtml = `<div class="item-now now-activity">
                    <span class="now-dot"></span>
                    <span>${lesson.subject}</span>
                    <span class="now-time">${lesson.waktu}</span>
                </div>`;
            }
        } else {
            nowHtml = `<div class="item-now now-idle">
                <span class="now-dot"></span>
                <span>Tidak ada pelajaran</span>
            </div>`;
        }

        return `
            <a href="${c.folder}/index.html" class="class-grid-item">
                <span class="item-accent accent-${acc}"></span>
                <span class="item-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </span>
                <span class="item-badge badge-${acc}">${c.level}</span>
                <div class="item-name">${c.name}</div>
                <div class="item-wali">Wali Kelas: ${c.wali}</div>
                ${nowHtml}
                <div class="item-mapel">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    Klik untuk melihat jadwal
                </div>
            </a>
        `;
    }).join('');
}

async function init() {
    renderClasses();

    const promises = classes.map(async (c) => {
        try {
            scheduleCache[c.folder] = await loadClassSchedule(c.folder);
        } catch (e) {
            scheduleCache[c.folder] = null;
        }
    });
    await Promise.all(promises);

    renderClasses(document.getElementById('search-input').value);

    setInterval(() => {
        renderClasses(document.getElementById('search-input').value);
    }, 30000);
}

let installPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
    init();

    document.getElementById('search-input').addEventListener('input', (e) => {
        renderClasses(e.target.value);
    });

    const autoToggle = document.getElementById('autoscroll-toggle');
    const autoInfo = document.getElementById('autoscroll-info');
    const tooltip = autoInfo.querySelector('.tooltip-text');
    document.body.appendChild(tooltip);

    function positionTooltip() {
        const rect = autoInfo.getBoundingClientRect();
        tooltip.style.top = (rect.top - 8) + 'px';
        tooltip.style.left = (rect.left - 10) + 'px';
        tooltip.style.transform = 'translateY(-100%)';
    }

    window.addEventListener('scroll', positionTooltip, { passive: true });
    window.addEventListener('resize', positionTooltip);
    autoInfo.addEventListener('mouseenter', () => {
        positionTooltip();
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
    });
    autoInfo.addEventListener('mouseleave', () => {
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
    });
    positionTooltip();

    function applyAutoScroll() {
        const saved = localStorage.getItem('autoScroll');
        const enabled = saved !== 'off';
        autoToggle.classList.toggle('active', enabled);
    }
    applyAutoScroll();

    autoToggle.addEventListener('click', (e) => {
        if (e.target.closest('.info-badge')) return;
        const enabled = !autoToggle.classList.contains('active');
        autoToggle.classList.toggle('active', enabled);
        localStorage.setItem('autoScroll', enabled ? 'on' : 'off');
    });

    const toggle = document.getElementById('theme-toggle');

    function applyTheme() {
        const saved = localStorage.getItem('theme');
        if (saved) {
            document.body.className = saved + '-theme';
        }
    }
    applyTheme();

    window.addEventListener('pageshow', applyTheme);

    toggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        document.body.className = isDark ? 'light-theme' : 'dark-theme';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // Mobile sidebar toggle
    const menuBtn = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    overlay.addEventListener('click', closeSidebar);

    // Close sidebar on window resize above breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    const installBtn = document.getElementById('install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        installPrompt = e;
        installBtn.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
        installPrompt = null;
        installBtn.classList.add('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const result = await installPrompt.userChoice;
        if (result.outcome === 'accepted') {
            installPrompt = null;
            installBtn.classList.add('hidden');
        }
    });

});
