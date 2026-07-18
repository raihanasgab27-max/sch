const FOLDER = 'IX_MAROKO';

const DAYS = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

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
            return event;
        }
    }
    return null;
}

async function loadTeacherMap() {
    const resp = await fetch(`${FOLDER}/script.js`);
    const text = await resp.text();
    const start = text.indexOf('const scheduleData = ');
    if (start === -1) return null;
    const objStart = text.indexOf('{', start);
    if (objStart === -1) return null;
    let depth = 0, objEnd = objStart;
    for (let i = objStart; i < text.length; i++) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') { depth--; if (depth === 0) { objEnd = i + 1; break; } }
    }
    let jsonStr = text.substring(objStart, objEnd);
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    try { return JSON.parse(jsonStr); } catch (e) { return null; }
}

function renderTeachers(data, filter = '') {
    const grid = document.getElementById('teacher-grid');
    const q = filter.toLowerCase().trim();
    const entries = Object.entries(data.teacher_map).filter(([code, name]) =>
        code.toLowerCase().includes(q) || name.toLowerCase().includes(q)
    );
    grid.innerHTML = entries.map(([code, name]) => {
        const initial = name.charAt(0).toUpperCase();
        return `
            <div class="teacher-card">
                <div class="teacher-card-avatar">${initial}</div>
                <div class="teacher-card-info">
                    <div class="teacher-card-name">${name}</div>
                    <div class="teacher-card-code">Kode: ${code}</div>
                </div>
            </div>
        `;
    }).join('');
    const total = document.getElementById('total-teachers');
    if (total) total.textContent = entries.length;
}

document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.getElementById('theme-toggle');

    function applyTheme() {
        const saved = localStorage.getItem('theme');
        if (saved) document.body.className = saved + '-theme';
    }
    applyTheme();
    window.addEventListener('pageshow', applyTheme);

    toggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        document.body.className = isDark ? 'light-theme' : 'dark-theme';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    const data = await loadTeacherMap();
    if (data) {
        renderTeachers(data);
        document.getElementById('total-teachers').textContent = Object.keys(data.teacher_map).length;
        document.getElementById('search-input').addEventListener('input', (e) => {
            renderTeachers(data, e.target.value);
        });
    }
});
