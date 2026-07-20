const TEACHER_MAP = {
  "AF": "Akmal Fauzi, M.Pd.I",
  "AS": "Aulia Safira",
  "DL": "Derliani Daulay, M.Pd",
  "DM": "Dara Mauliza, S.Pd",
  "DN": "Dini",
  "FY": "Fitri Yani, S.Pd",
  "HN": "Husni",
  "HR": "Hasrul",
  "IQ": "Iqbal",
  "JM": "Januar Musa, S.Pd",
  "JS": "Jamil Sagala",
  "KH": "Muhammad Kholis, M.Pd",
  "KK": "Khairul Khair, S.Pd",
  "MA": "Marwan Adha, S.Pd",
  "MD": "Mirdi Yandi, S.Pd",
  "ML": "Marlina Sukmawati, Lc",
  "MN": "Mirna Risafani, Lc",
  "MR": "Maryono, S.Pd",
  "MS": "Mutiara Sari, S.Si.,M.Si",
  "MY": "Muhammad Yusuf, S.Pd",
  "NJ": "Najaruddin Ritonga, S.Pd",
  "NR": "Nofa Rafiah, S.Pd",
  "NW": "Nazwa, S.Pd",
  "PA": "Putri Arianti, S.Pd",
  "PT": "Putriany, S.Pd",
  "QR": "Qory, S.Pd",
  "RA": "Rahmadani Mamina, SE",
  "RH": "Rahmad Hidayat, S.Pd.I.,M.Pd",
  "RK": "Rika Dara Yanti, S.Kom",
  "RM": "Muhammad Ramadan, S.Ag",
  "SF": "Saiful",
  "SS": "Siti Salamah S, S.Pd.I",
  "VS": "Vivi Syahfitri, S.Pd",
  "YL": "Yuliani Mutia Wahna, S.Pd",
  "ZF": "Zulfikri, S.Fil.I"
};

function renderTeachers(filter = '') {
  const grid = document.getElementById('teacher-grid');
  const q = filter.toLowerCase().trim();
  const entries = Object.entries(TEACHER_MAP).filter(([code, name]) =>
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

document.addEventListener('DOMContentLoaded', () => {
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

  renderTeachers();
  document.getElementById('total-teachers').textContent = Object.keys(TEACHER_MAP).length;
  document.getElementById('search-input').addEventListener('input', (e) => {
    renderTeachers(e.target.value);
  });
});
