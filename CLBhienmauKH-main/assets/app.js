const DB_KEY = 'uhs_blood_club_db_v2';
const AUTH_KEY = 'uhs_blood_club_auth_v2';
const VI_RESET_KEY = 'uhs_vi_random_reset_v2';
const FOCUS_PROGRAM_KEY = 'uhs_focus_program_id_v1';

function id(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seed() {
  return {
    users: [
      { id: 'u_admin', email: 'admin@uhs.edu.vn', password: '12345678', role: 'admin', memberId: null },
      { id: 'u_member1', email: 'member1@uhs.edu.vn', password: '12345678', role: 'member', memberId: 'm1' }
    ],
    members: [
      { id: 'm1', fullName: 'Alex Rivera', studentCode: '20230001', email: 'member1@uhs.edu.vn', phone: '0901000001', cccd: '079200000001', bloodGroup: 'O+', joinedAt: '2025-09-01' }
    ],
    programs: [
      { id: 'p1', name: 'Đợt Hiến Máu Học Kỳ Xuân', date: '2026-04-15', timeRange: '09:00-16:00', location: 'Sảnh tòa nhà Khoa học', expectedCount: 300, description: 'Sự kiện trọng điểm học kỳ xuân', status: 'upcoming' },
      { id: 'p2', name: 'Ngày Hội Hiến Máu Khối Kỹ thuật', date: '2026-04-22', timeRange: '10:00-17:00', location: 'Trung tâm Đổi mới, tầng 2', expectedCount: 250, description: 'Chương trình liên khoa', status: 'upcoming' }
    ],
    registrations: [
      { id: 'r1', fullName: 'Trần Thị B', studentCode: '20239999', phone: '0909999999', email: 'b@uhs.edu.vn', cccd: '079200000099', bloodGroup: 'A+', desiredAt: '2026-04-15T10:30', programId: 'p1', status: 'ChoDuyet', reviewedBy: null, reviewedAt: null }
    ],
    notifications: [
      {
        id: 'n1',
        title: 'Thông báo lịch tiếp nhận hiến máu',
        summary: 'CLB cập nhật lịch tiếp nhận hiến máu trong tháng này.',
        content: 'Vui lòng theo dõi lịch tiếp nhận hiến máu được cập nhật trên hệ thống và đăng ký theo khung giờ phù hợp.',
        createdAt: new Date().toISOString(),
        sentBy: 'u_admin',
        attachmentLabel: '',
        attachmentUrl: '',
        conditions: [],
        notes: [],
        isSent: true,
        sentAt: new Date().toISOString(),
        targetRole: 'member'
      }
    ],
    notificationReads: [],
    history: [
      { id: 'h1', personKey: '079200000001', fullName: 'Alex Rivera', programId: 'p1', registrationId: null, status: 'DaDuyet', participated: true, donatedAt: '2026-03-01' }
    ]
  };
}

function db() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const data = seed();
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    return data;
  }
  return JSON.parse(raw);
}

function save(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function ensureDefaultMemberAccount() {
  const data = db();
  let changed = false;

  const defaultEmail = 'member1@uhs.edu.vn';
  const defaultMemberId = 'm1';

  let member = data.members.find(m => m.id === defaultMemberId || m.email === defaultEmail);
  if (!member) {
    member = {
      id: defaultMemberId,
      fullName: 'Alex Rivera',
      studentCode: '20230001',
      email: defaultEmail,
      phone: '0901000001',
      cccd: '079200000001',
      bloodGroup: 'O+',
      joinedAt: '2025-09-01'
    };
    data.members.push(member);
    changed = true;
  }

  let user = data.users.find(u => u.email === defaultEmail || u.memberId === member.id);
  if (!user) {
    data.users.push({
      id: 'u_member1',
      email: defaultEmail,
      password: '12345678',
      role: 'member',
      memberId: member.id
    });
    changed = true;
  } else {
    if (user.role !== 'member') {
      user.role = 'member';
      changed = true;
    }
    if (!user.memberId || !data.members.some(m => m.id === user.memberId)) {
      user.memberId = member.id;
      changed = true;
    }
  }

  if (changed) save(data);
}

function ensureNotificationSchema() {
  const data = db();
  let changed = false;

  data.notifications = (data.notifications || []).map(n => {
    const next = { ...n };
    if (!next.summary) {
      next.summary = String(next.content || '').slice(0, 180) || 'Thông báo hệ thống';
      changed = true;
    }
    if (!next.content) {
      next.content = next.summary;
      changed = true;
    }
    if (!next.createdAt) {
      next.createdAt = new Date().toISOString();
      changed = true;
    }
    if (!Array.isArray(next.conditions)) {
      next.conditions = [];
      changed = true;
    }
    if (!Array.isArray(next.notes)) {
      next.notes = [];
      changed = true;
    }
    if (typeof next.attachmentLabel === 'undefined') {
      next.attachmentLabel = '';
      changed = true;
    }
    if (typeof next.attachmentUrl === 'undefined') {
      next.attachmentUrl = '';
      changed = true;
    }
    if (typeof next.isSent === 'undefined') {
      next.isSent = true;
      changed = true;
    }
    if (typeof next.sentAt === 'undefined') {
      next.sentAt = next.createdAt || new Date().toISOString();
      changed = true;
    }
    if (!next.targetRole) {
      next.targetRole = 'member';
      changed = true;
    }
    return next;
  });

  if (changed) save(data);
}

function ensureExtraSeedData() {
  const data = db();
  let changed = false;
  // Assign banner images cyclically to all programs that don't have one yet
  const bannerImages = [
    'assets/program_p_vi_10.webp',
    'assets/program_banner_2.webp',
    'assets/program_banner_3.webp',
  ];
  data.programs.forEach((p, idx) => {
    if (!p.image) {
      p.image = bannerImages[idx % bannerImages.length];
      changed = true;
    }
  });
  if (changed) save(data);
}

function auth() {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setAuth(v) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(v));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

function byId(sel) {
  return document.getElementById(sel);
}

function roleGuard(role) {
  const a = auth();
  if (!a || a.role !== role) {
    location.href = role === 'admin' || role === 'member' ? '../login.html' : 'login.html';
    return null;
  }
  return a;
}

function programName(data, programId) {
  const p = data.programs.find(x => x.id === programId);
  return p ? p.name : 'Không rõ';
}

function parseTimeRange(timeRange) {
  const raw = String(timeRange || '').trim();
  const [startRaw, endRaw] = raw.split('-').map(s => String(s || '').trim());
  const start = /^\d{1,2}:\d{2}$/.test(startRaw) ? startRaw : '08:00';
  const end = /^\d{1,2}:\d{2}$/.test(endRaw) ? endRaw : '17:00';
  return { start, end };
}

function programTimeline(program) {
  const { start, end } = parseTimeRange(program.timeRange);
  const startAt = new Date(`${program.date}T${start}:00`).getTime();
  const endAt = new Date(`${program.date}T${end}:00`).getTime();
  return {
    startAt: Number.isNaN(startAt) ? 0 : startAt,
    endAt: Number.isNaN(endAt) ? 0 : endAt
  };
}

function programPhase(program, now = Date.now()) {
  const t = programTimeline(program);
  if (!t.startAt || !t.endAt) return 'upcoming';
  if (now < t.startAt) return 'upcoming';
  if (now >= t.startAt && now <= t.endAt) return 'ongoing';
  return 'ended';
}

function canRegisterProgram(program, now = Date.now()) {
  return programPhase(program, now) !== 'ended';
}

function toDateText(iso) {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleString('vi-VN'); } catch (_) { return iso; }
}

function bindLogout(btnId, prefix = '') {
  const btn = byId(btnId);
  if (!btn) return;
  btn.addEventListener('click', () => {
    clearAuth();
    location.href = `${prefix}index.html`;
  });
}

function initHome() {
  const data = db();
  const cPrograms = byId('homeProgramsCount');
  const cMembers = byId('homeMembersCount');
  const cPending = byId('homePendingCount');
  if (cPrograms) cPrograms.textContent = String(data.programs.length);
  if (cMembers) cMembers.textContent = String(data.members.length);
  if (cPending) cPending.textContent = String(data.registrations.filter(r => r.status === 'ChoDuyet').length);

  const viewport = byId('homeProgramsCarousel');
  const track = byId('homeProgramsTrack');
  const prevBtn = byId('homeProgramsPrev');
  const nextBtn = byId('homeProgramsNext');
  if (!viewport || !track) return;

  const now = Date.now();
  const upcoming = [...data.programs]
    .filter(p => programPhase(p, now) === 'upcoming')
    .sort((a, b) => programTimeline(b).startAt - programTimeline(a).startAt);

  if (!upcoming.length) {
    viewport.innerHTML = '<article class="bg-white rounded-3xl p-6 editorial-shadow"><h3 class="font-headline text-xl font-bold">Chưa có chương trình sắp tới</h3><p class="text-sm text-on-surface-variant mt-2">Hệ thống sẽ cập nhật chương trình mới sớm nhất.</p></article>';
    prevBtn?.classList.add('hidden');
    if (nextBtn) nextBtn.classList.add('hidden');
    return;
  }

  track.innerHTML = upcoming.map(p => `
    <article class="home-program-card home-carousel-item">
      ${p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:148px;object-fit:cover;display:block;flex-shrink:0;" />` : ''}
      <div class="p-6 flex flex-col flex-1">
        <h3 class="font-headline text-xl font-bold">${p.name}</h3>
        <p class="text-sm text-on-surface-variant mt-3">Thời gian: ${p.date} (${p.timeRange})</p>
        <p class="text-sm text-on-surface-variant mt-1">Địa điểm: ${p.location}</p>
        <a href="programs.html?focusProgramId=${p.id}" data-focus-program-id="${p.id}" class="mt-auto inline-block px-4 py-2 rounded-xl bg-primary text-white font-semibold home-view-btn">Xem thêm</a>
      </div>
    </article>
  `).join('');

  track.addEventListener('click', e => {
    const link = e.target.closest('a[data-focus-program-id]');
    if (!link) return;
    const focusProgramId = link.getAttribute('data-focus-program-id') || '';
    if (!focusProgramId) return;
    e.preventDefault();
    sessionStorage.setItem(FOCUS_PROGRAM_KEY, focusProgramId);
    location.href = `programs.html?focusProgramId=${encodeURIComponent(focusProgramId)}#program-card-${encodeURIComponent(focusProgramId)}`;
  });

  const getVisibleCount = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  let currentIndex = 0;

  const itemStep = () => {
    const firstItem = track.querySelector('.home-carousel-item');
    if (!firstItem) return 0;
    const style = getComputedStyle(firstItem);
    const marginRight = parseFloat(style.marginRight || '0');
    return firstItem.getBoundingClientRect().width + marginRight;
  };

  const updateButtons = () => {
    const visibleCount = getVisibleCount();
    if (upcoming.length <= visibleCount) {
      prevBtn?.classList.add('hidden');
      nextBtn?.classList.add('hidden');
      return;
    }
    prevBtn?.classList.remove('hidden');
    nextBtn?.classList.remove('hidden');
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
  };

  const slideTo = index => {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, upcoming.length - visibleCount);
    
    let nextIndex = index;
    if (nextIndex < 0) nextIndex = maxIndex;
    else if (nextIndex > maxIndex) nextIndex = 0;
    
    currentIndex = Math.min(maxIndex, nextIndex);
    track.style.transform = `translateX(-${currentIndex * itemStep()}px)`;
    updateButtons();
  };

  prevBtn?.addEventListener('click', () => slideTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => slideTo(currentIndex + 1));
  window.addEventListener('resize', () => slideTo(currentIndex));

  slideTo(0);
}

function initPrograms() {
  const data = db();
  const list = byId('programsList');
  const q = byId('programSearch');
  if (!list) return;

  const url = new URL(location.href);
  const focusFromQuery = url.searchParams.get('focusProgramId') || '';
  const focusFromSession = sessionStorage.getItem(FOCUS_PROGRAM_KEY) || '';
  const hashRaw = decodeURIComponent(location.hash || '').replace(/^#/, '');
  const focusFromHash = hashRaw.startsWith('program-card-') ? hashRaw.slice('program-card-'.length) : '';
  const focusProgramId = focusFromQuery || focusFromSession || focusFromHash;
  let focusHandled = false;

  if (focusProgramId && q && q.value.trim()) q.value = '';

  const render = () => {
    const keyword = (q?.value || '').toLowerCase().trim();
    const now = Date.now();
    const filtered = [...data.programs]
      .filter(p => `${p.name} ${p.location}`.toLowerCase().includes(keyword))
      .sort((a, b) => programTimeline(b).startAt - programTimeline(a).startAt);
    list.innerHTML = filtered.map((p, idx) => `
      <article id="program-card-${p.id}" class="bg-surface-container-lowest rounded-2xl editorial-shadow border border-outline-variant/15 program-card stagger-item overflow-hidden" style="--stagger:${idx};">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:200px;object-fit:cover;display:block;" />` : ''}
        <div class="p-6">
          <h3 class="font-headline text-2xl font-bold">${p.name}</h3>
          <p class="text-on-surface-variant mt-2">${p.description || ''}</p>
          <div class="mt-4 text-sm text-on-surface-variant">
            <div>Thời gian: ${p.date} (${p.timeRange})</div>
            <div>Địa điểm: ${p.location}</div>
            <div>Số lượng dự kiến: ${p.expectedCount}</div>
            <div>Trạng thái: ${programPhase(p, now) === 'upcoming' ? 'Sắp tới' : (programPhase(p, now) === 'ongoing' ? 'Đang diễn ra' : 'Đã kết thúc')}</div>
          </div>
          ${canRegisterProgram(p, now)
            ? `<a href="register.html?programId=${p.id}" class="mt-5 inline-block signature-gradient px-5 py-2 rounded-xl text-white font-bold">Đăng ký hiến máu</a>`
            : `<span class="mt-5 inline-block px-5 py-2 rounded-xl bg-surface-container-low text-on-surface-variant font-bold">Đã kết thúc đăng ký</span>`}
        </div>
      </article>
    `).join('') || '<div class="text-on-surface-variant">Không tìm thấy chương trình.</div>';

    if (!focusProgramId || focusHandled) return;

    const tryFocus = (attempt = 0) => {
      const target = byId(`program-card-${focusProgramId}`);
      if (!target) {
        if (attempt < 20) {
          setTimeout(() => tryFocus(attempt + 1), 120);
          return;
        }
        focusHandled = true;
        sessionStorage.removeItem(FOCUS_PROGRAM_KEY);
        return;
      }

      const stickyOffset = 110;
      const y = window.scrollY + target.getBoundingClientRect().top - stickyOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      // Remove enter animation class so pulse effect can be seen clearly.
      target.classList.remove('stagger-item');
      target.classList.add('program-focus-pulse');
      setTimeout(() => target.classList.remove('program-focus-pulse'), 2000);

      // One extra nudge after smooth-scroll starts to handle async layout shifts.
      setTimeout(() => {
        const yRetry = window.scrollY + target.getBoundingClientRect().top - stickyOffset;
        window.scrollTo({ top: Math.max(0, yRetry), behavior: 'smooth' });
      }, 180);

      focusHandled = true;
      sessionStorage.removeItem(FOCUS_PROGRAM_KEY);
    };

    if (!byId(`program-card-${focusProgramId}`)) {
      // If a keyword is active and hides the target card, reset filter once and try again.
      if (keyword && q) {
        q.value = '';
        render();
        return;
      }
    }

    // Delay a tick so layout/animation settles before scrolling.
    setTimeout(() => tryFocus(0), 60);
  };

  q?.addEventListener('input', render);
  render();
}

function initRegister() {
  const data = db();
  const form = byId('registerForm');
  const select = byId('registerProgram');
  const note = byId('registerNotice');
  const backLink = byId('registerBackLink');
  if (!form || !select) return;

  const currentAuth = auth();
  if (backLink && currentAuth?.role === 'member') {
    backLink.href = 'member/dashboard.html';
    backLink.textContent = '← Trang chủ thành viên';
  } else if (backLink && currentAuth?.role === 'admin') {
    backLink.href = 'admin/dashboard.html';
    backLink.textContent = '← Trang chủ quản trị';
  }

  const now = Date.now();
  const availablePrograms = data.programs.filter(p => canRegisterProgram(p, now));
  select.innerHTML = availablePrograms.map(p => `<option value="${p.id}">${p.name} - ${p.date}</option>`).join('');
  if (!availablePrograms.length) {
    note.textContent = 'Hiện không có chương trình còn hạn đăng ký.';
    note.className = 'mt-4 text-sm text-error';
  }
  const url = new URL(location.href);
  const programId = url.searchParams.get('programId');
  if (programId && availablePrograms.some(p => p.id === programId)) select.value = programId;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const reg = {
      id: id('r'),
      fullName: String(fd.get('fullName') || '').trim(),
      studentCode: String(fd.get('studentCode') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      cccd: String(fd.get('cccd') || '').trim(),
      bloodGroup: String(fd.get('bloodGroup') || 'Chưa biết').trim(),
      desiredAt: String(fd.get('desiredAt') || ''),
      programId: String(fd.get('programId') || ''),
      status: 'ChoDuyet',
      reviewedBy: null,
      reviewedAt: null
    };

    if (!reg.fullName || !reg.phone || !reg.email || !reg.cccd || !reg.programId) {
      note.textContent = 'Vui lòng nhập đầy đủ thông tin bắt buộc.';
      note.className = 'mt-4 text-sm text-error';
      return;
    }

    const selectedProgram = data.programs.find(p => p.id === reg.programId);
    if (!selectedProgram || !canRegisterProgram(selectedProgram)) {
      note.textContent = 'Chương trình đã kết thúc, vui lòng chọn chương trình khác.';
      note.className = 'mt-4 text-sm text-error';
      return;
    }

    data.registrations.push(reg);
    data.history.push({
      id: id('h'),
      personKey: reg.cccd || reg.phone,
      fullName: reg.fullName,
      programId: reg.programId,
      registrationId: reg.id,
      status: 'ChoDuyet',
      participated: false,
      donatedAt: null
    });
    save(data);

    form.reset();
    note.textContent = 'Đăng ký thành công. Đơn của bạn đang ở trạng thái Chờ duyệt.';
    note.className = 'mt-4 text-sm text-tertiary font-semibold';
  });
}

function initLookup() {
  const form = byId('lookupForm');
  const input = byId('lookupKey');
  const tbody = byId('lookupBody');
  const cards = byId('lookupCards');
  const totalNode = byId('lookupTotal');
  const latestNode = byId('lookupLatest');
  const statusNode = byId('lookupStatus');
  const hintNode = byId('lookupResultHint');
  if (!form || !input || !tbody) return;

  const statusLabel = status => {
    if (status === 'DaDuyet') return 'Đã duyệt';
    if (status === 'ChoDuyet') return 'Chờ duyệt';
    if (status === 'TuChoi') return 'Từ chối';
    return status || 'Không xác định';
  };

  const statusClass = status => {
    if (status === 'DaDuyet') return 'approved';
    if (status === 'ChoDuyet') return 'pending';
    if (status === 'TuChoi') return 'rejected';
    return 'default';
  };

  const resetStats = () => {
    if (totalNode) totalNode.textContent = '0';
    if (latestNode) latestNode.textContent = '-';
    if (statusNode) statusNode.textContent = '-';
  };

  const renderEmpty = message => {
    tbody.innerHTML = `<tr><td colspan="5" class="py-5 text-on-surface-variant">${message}</td></tr>`;
    if (cards) cards.innerHTML = `<article class="lookup-empty">${message}</article>`;
  };

  const setHint = text => {
    if (hintNode) hintNode.textContent = text;
  };

  const keyValidator = /^\d{10,12}$/;

  setHint('');
  renderEmpty('');
  resetStats();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = db();
    const key = input.value.trim().replace(/\s+/g, '');

    if (!key) {
      setHint('');
      renderEmpty('');
      resetStats();
      return;
    }

    if (!keyValidator.test(key)) {
      setHint('Định dạng chưa hợp lệ. Vui lòng nhập 10-12 chữ số.');
      renderEmpty('CCCD hoặc SĐT không đúng định dạng.');
      resetStats();
      return;
    }

    setHint('Đang tra cứu dữ liệu...');
    renderEmpty('Đang tải kết quả...');

    const rows = data.history.filter(h => (h.personKey || '').includes(key));
    if (!rows.length) {
      setHint('Không tìm thấy dữ liệu phù hợp.');
      renderEmpty('Không tìm thấy dữ liệu với thông tin vừa nhập.');
      resetStats();
      return;
    }

    const donatedRows = rows.filter(h => h.participated);
    if (totalNode) totalNode.textContent = String(donatedRows.length);

    const rowsWithDate = rows
      .map(h => ({ ...h, _time: new Date(h.donatedAt || 0).getTime() }))
      .sort((a, b) => b._time - a._time);
    const latest = rowsWithDate[0];

    if (latestNode) latestNode.textContent = latest?.donatedAt ? toDateText(latest.donatedAt) : 'Chưa có';
    if (statusNode) statusNode.textContent = statusLabel(latest?.status);
    setHint(`Tìm thấy ${rows.length} bản ghi.`);

    tbody.innerHTML = rows.map(h => `
      <tr class="border-b border-outline-variant/20">
        <td class="py-3">${h.fullName}</td>
        <td class="py-3">${programName(data, h.programId)}</td>
        <td class="py-3"><span class="lookup-status-badge ${statusClass(h.status)}">${statusLabel(h.status)}</span></td>
        <td class="py-3">${h.participated ? 'Có' : 'Chưa'}</td>
        <td class="py-3">${h.donatedAt ? toDateText(h.donatedAt) : '-'}</td>
      </tr>
    `).join('');

    if (cards) {
      cards.innerHTML = rows.map(h => `
        <article class="lookup-card">
          <p class="lookup-card-title">${h.fullName}</p>
          <p class="lookup-card-meta">${programName(data, h.programId)}</p>
          <div class="mt-2"><span class="lookup-status-badge ${statusClass(h.status)}">${statusLabel(h.status)}</span></div>
          <p class="lookup-card-meta mt-2">Tham gia thực tế: ${h.participated ? 'Có' : 'Chưa'}</p>
          <p class="lookup-card-meta">Ngày hiến: ${h.donatedAt ? toDateText(h.donatedAt) : '-'}</p>
        </article>
      `).join('');
    }
  });
}

function initLogin() {
  const form = byId('loginForm');
  const note = byId('loginNotice');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '').trim();
    const data = db();
    const user = data.users.find(u => u.email === email && u.password === password);

    if (!user) {
      note.textContent = 'Sai tài khoản hoặc mật khẩu.';
      note.className = 'mt-3 text-sm text-error';
      return;
    }

    setAuth({ userId: user.id, role: user.role, memberId: user.memberId });
    if (user.role === 'admin') location.href = 'admin/dashboard.html';
    else location.href = 'member/dashboard.html';
  });
}

function closeAuthModal() {
  const modal = byId('authPopupOverlay');
  if (!modal) return;
  modal.remove();
  document.body.classList.remove('modal-open');
}

function mountAuthModal(contentHtml) {
  closeAuthModal();
  const wrapper = document.createElement('div');
  wrapper.id = 'authPopupOverlay';
  wrapper.className = 'auth-modal-overlay';
  wrapper.innerHTML = `
    <div class="auth-modal-card" role="dialog" aria-modal="true">
      <button type="button" class="auth-modal-close" aria-label="Đóng popup">×</button>
      ${contentHtml}
    </div>
  `;
  document.body.appendChild(wrapper);
  document.body.classList.add('modal-open');

  wrapper.addEventListener('click', e => {
    if (e.target === wrapper) closeAuthModal();
  });
  wrapper.querySelector('.auth-modal-close')?.addEventListener('click', closeAuthModal);
}

function openLoginModal() {
  mountAuthModal(`
    <div class="auth-login-shell">
      <section class="auth-login-left">
        <p class="uppercase text-xs tracking-[0.2em] font-bold">CLB Hiến Máu Khoa Học</p>
        <h2 class="font-headline text-3xl md:text-4xl font-extrabold mt-4 leading-tight">Đăng nhập để quản lý và đồng hành cùng cộng đồng hiến máu.</h2>
        <p class="mt-5 text-sm text-white/85">Dành cho Admin và Member. User vẫn có thể xem chương trình và đăng ký mà không cần đăng nhập.</p>
        <div class="mt-8 text-sm text-white/90">Tài khoản demo:<br />admin@uhs.edu.vn / 12345678</div>
      </section>
      <section class="auth-login-right">
        <h3 class="font-headline text-3xl font-extrabold">Đăng nhập</h3>
        <form id="loginPopupForm" class="mt-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Email</label>
            <input name="email" type="email" class="w-full rounded-xl bg-surface-container-low border-none" placeholder="you@uhs.edu.vn" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Mật khẩu</label>
            <input name="password" type="password" class="w-full rounded-xl bg-surface-container-low border-none" placeholder="••••••••" />
          </div>
          <button type="submit" class="w-full py-3 rounded-xl signature-gradient text-white font-bold">Đăng nhập</button>
        </form>
        <p id="loginPopupNotice" class="mt-3 text-sm"></p>
        <div class="mt-6 text-xs text-on-surface-variant">Tài khoản demo: admin@uhs.edu.vn / 12345678, member1@uhs.edu.vn / 12345678</div>
      </section>
    </div>
  `);

  const form = byId('loginPopupForm');
  const note = byId('loginPopupNotice');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '').trim();
    const data = db();
    const user = data.users.find(u => u.email === email && u.password === password);

    if (!user) {
      if (note) {
        note.textContent = 'Sai tài khoản hoặc mật khẩu.';
        note.className = 'mt-3 text-sm text-error';
      }
      return;
    }

    setAuth({ userId: user.id, role: user.role, memberId: user.memberId });
    if (user.role === 'admin') location.href = 'admin/dashboard.html';
    else location.href = 'member/dashboard.html';
  });
}

function openRegisterModal(preselectedProgramId = '') {
  mountAuthModal(`
    <div class="auth-modal-content">
      <h2 class="font-headline text-3xl font-extrabold text-primary">Đăng ký hiến máu</h2>
      <p class="mt-2 text-sm text-on-surface-variant">Vui lòng điền thông tin chính xác. Đơn đăng ký sẽ ở trạng thái <strong class="text-primary">Chờ duyệt</strong> để Admin xử lý.</p>
      <form id="registerPopupForm" class="mt-6 grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-1">Họ và tên</label>
          <input name="fullName" class="popup-emphasis w-full rounded-xl border-none" placeholder="Nguyen Van A" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Mã sinh viên</label>
          <input name="studentCode" class="popup-emphasis w-full rounded-xl border-none" placeholder="2023xxxx" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Số điện thoại</label>
          <input name="phone" class="popup-emphasis w-full rounded-xl border-none" placeholder="09xxxxxxxx" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Email</label>
          <input name="email" type="email" class="popup-emphasis w-full rounded-xl border-none" placeholder="you@uhs.edu.vn" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">CCCD</label>
          <input name="cccd" class="popup-emphasis w-full rounded-xl border-none" placeholder="0792xxxxxxxx" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Nhóm máu (nếu có)</label>
          <select name="bloodGroup" class="popup-emphasis w-full rounded-xl border-none">
            <option>Chưa biết</option><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-semibold mb-1">Chương trình</label>
          <select id="registerPopupProgram" name="programId" class="popup-emphasis w-full rounded-xl border-none"></select>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Thời gian mong muốn</label>
          <input name="desiredAt" type="datetime-local" class="popup-emphasis w-full rounded-xl border-none" />
        </div>
        <div class="md:col-span-2 flex">
          <button type="submit" class="signature-gradient text-white px-8 py-3 rounded-xl font-bold">Gửi đăng ký</button>
        </div>
      </form>
      <p id="registerPopupNotice" class="mt-3 text-sm"></p>
    </div>
  `);

  const data = db();
  const now = Date.now();
  const programs = data.programs.filter(p => canRegisterProgram(p, now));
  const form = byId('registerPopupForm');
  const select = byId('registerPopupProgram');
  const note = byId('registerPopupNotice');
  if (!form || !select || !note) return;

  select.innerHTML = programs.map(p => `<option value="${p.id}">${p.name} - ${p.date}</option>`).join('');
  if (preselectedProgramId && programs.some(p => p.id === preselectedProgramId)) {
    select.value = preselectedProgramId;
  }
  if (!programs.length) {
    note.textContent = 'Hiện không có chương trình còn hạn đăng ký.';
    note.className = 'mt-3 text-sm text-error';
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const reg = {
      id: id('r'),
      fullName: String(fd.get('fullName') || '').trim(),
      studentCode: String(fd.get('studentCode') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      cccd: String(fd.get('cccd') || '').trim(),
      bloodGroup: String(fd.get('bloodGroup') || 'Chưa biết').trim(),
      desiredAt: String(fd.get('desiredAt') || ''),
      programId: String(fd.get('programId') || ''),
      status: 'ChoDuyet',
      reviewedBy: null,
      reviewedAt: null
    };

    if (!reg.fullName || !reg.phone || !reg.email || !reg.cccd || !reg.programId) {
      note.textContent = 'Vui lòng nhập đầy đủ thông tin bắt buộc.';
      note.className = 'mt-3 text-sm text-error';
      return;
    }

    const selectedProgram = data.programs.find(p => p.id === reg.programId);
    if (!selectedProgram || !canRegisterProgram(selectedProgram)) {
      note.textContent = 'Chương trình đã kết thúc, vui lòng chọn chương trình khác.';
      note.className = 'mt-3 text-sm text-error';
      return;
    }

    data.registrations.push(reg);
    data.history.push({
      id: id('h'),
      personKey: reg.cccd || reg.phone,
      fullName: reg.fullName,
      programId: reg.programId,
      registrationId: reg.id,
      status: 'ChoDuyet',
      participated: false,
      donatedAt: null
    });
    save(data);

    form.reset();
    note.textContent = 'Đăng ký thành công. Đơn của bạn đang ở trạng thái Chờ duyệt.';
    note.className = 'mt-3 text-sm text-tertiary font-semibold';
  });
}

function bindAuthPopupTriggers() {
  if (document.body.dataset.popupBound === '1') return;
  document.body.dataset.popupBound = '1';

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href === 'login.html') {
      e.preventDefault();
      openLoginModal();
      return;
    }

    if (href.startsWith('register.html') || href.startsWith('../register.html')) {
      e.preventDefault();
      const url = new URL(href, location.href);
      const preselectedProgramId = url.searchParams.get('programId') || '';
      openRegisterModal(preselectedProgramId);
    }
  });
}

function bindPageTransitions() {
  document.body.classList.add('page-enter');
  requestAnimationFrame(() => document.body.classList.add('page-enter-active'));

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;

    const href = link.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (href.startsWith('login.html') || href.startsWith('register.html') || href.startsWith('../register.html')) return;

    const url = new URL(href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;

    e.preventDefault();
    document.body.classList.add('page-leave');
    setTimeout(() => {
      location.href = url.href;
    }, 180);
  });
}

function buildAdminSidebar(active) {
  return `
    <aside class="sidebar bg-slate-100 p-6 sticky top-0 self-start lg:h-screen max-h-screen overflow-y-auto z-40">
      <div class="sidebar-header flex justify-between items-center w-full">
        <h1 class="sidebar-title font-headline font-extrabold text-xl text-primary">CLB Hiến Máu Khoa Học</h1>
        <button type="button" class="sidebar-toggle lg:hidden p-2 rounded-lg text-primary focus:outline-none bg-slate-200" onclick="document.getElementById('sidebarContent').classList.toggle('hidden');">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
      <div id="sidebarContent" class="sidebar-content hidden lg:block w-full">
        <nav class="sidebar-nav mt-8 space-y-1 text-sm">
          <a class="block px-4 py-3 rounded-xl ${active === 'dashboard' ? 'bg-white text-primary font-bold' : 'hover:bg-white'}" href="dashboard.html">Tổng quan</a>
          <a class="block px-4 py-3 rounded-xl ${active === 'members' ? 'bg-white text-primary font-bold' : 'hover:bg-white'}" href="members.html">Thành viên</a>
          <a class="block px-4 py-3 rounded-xl ${active === 'programs' ? 'bg-white text-primary font-bold' : 'hover:bg-white'}" href="programs.html">Chương trình</a>
          <a class="block px-4 py-3 rounded-xl ${active === 'registrations' ? 'bg-white text-primary font-bold' : 'hover:bg-white'}" href="registrations.html">Đăng ký</a>
          <a class="block px-4 py-3 rounded-xl ${active === 'notifications' ? 'bg-white text-primary font-bold' : 'hover:bg-white'}" href="notifications.html">Thông báo</a>

        </nav>
        <div class="sidebar-actions">
          <button id="adminLogout" class="mt-8 px-4 py-2 rounded-xl bg-white text-sm font-semibold">Đăng xuất</button>
        </div>
      </div>
    </aside>
  `;
}

function initAdminDashboard() {
  if (!roleGuard('admin')) return;
  const data = db();
  byId('adminSidebar').innerHTML = buildAdminSidebar('dashboard');
  bindLogout('adminLogout', '../');
  byId('kpiMembers').textContent = String(data.members.length);
  byId('kpiPrograms').textContent = String(data.programs.length);
  byId('kpiPending').textContent = String(data.registrations.filter(r => r.status === 'ChoDuyet').length);
  byId('kpiParticipated').textContent = String(data.history.filter(h => h.participated).length);
}

function initAdminMembers() {
  if (!roleGuard('admin')) return;
  const data = db();
  byId('adminSidebar').innerHTML = buildAdminSidebar('members');
  bindLogout('adminLogout', '../');
  const tbody = byId('membersBody');
  const form = byId('memberForm');
  const submitBtn = byId('memberSubmitBtn');
  const cancelBtn = byId('memberCancelEditBtn');
  const editIdInput = byId('memberEditId');

  const VALID_BLOOD_GROUPS = new Set(['A-','B-','O-','AB-','A+','B+','O+','AB+']);

  const resetEditor = () => {
    if (editIdInput) editIdInput.value = '';
    if (submitBtn) submitBtn.textContent = 'Thêm thành viên';
    if (cancelBtn) cancelBtn.classList.add('hidden');
    form?.reset();
    // Clear account email mirror after reset
    const accEl = byId('memberAccountEmail');
    if (accEl) accEl.value = '';
    // Reset password field: no text → default visible (type=text), icon = visibility
    const pwdEl = byId('memberAccountPassword');
    const eyeIcon = byId('memberPasswordEyeIcon');
    if (pwdEl) { pwdEl.value = ''; pwdEl.type = 'text'; }
    if (eyeIcon) eyeIcon.textContent = 'visibility';
    // Clear error notices
    const bgErr = byId('bloodGroupError');
    if (bgErr) bgErr.classList.add('hidden');
    const notice = byId('memberFormNotice');
    if (notice) { notice.textContent = ''; notice.classList.add('hidden'); }
  };

  const render = () => {
    tbody.innerHTML = data.members.map(m => {
      const hasAccount = data.users.some(u => u.memberId === m.id);
      return `
      <tr class="border-b border-outline-variant/20">
        <td class="py-3">${m.fullName}</td>
        <td class="py-3">${m.studentCode}</td>
        <td class="py-3">${m.email}</td>
        <td class="py-3">${m.phone}</td>
        <td class="py-3">${m.bloodGroup || '-'}</td>
        <td class="py-3">
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${hasAccount ? 'bg-tertiary-fixed text-tertiary' : 'bg-surface-container-low text-on-surface-variant'}">
            <span class="material-symbols-outlined" style="font-size:0.95rem;">${hasAccount ? 'check_circle' : 'radio_button_unchecked'}</span>
            ${hasAccount ? 'Có tài khoản' : 'Chưa có'}
          </span>
        </td>
        <td class="py-3 flex gap-2">
          <button data-edit-member="${m.id}" class="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">Sửa</button>
          <button data-del-member="${m.id}" class="px-3 py-1 rounded-lg bg-error-container text-error text-xs font-bold">Xóa</button>
        </td>
      </tr>
    `; }).join('') || '<tr><td colspan="7" class="py-4 text-on-surface-variant">Chưa có thành viên.</td></tr>';

    document.querySelectorAll('[data-edit-member]').forEach(btn => {
      btn.addEventListener('click', () => {
        const memberId = btn.getAttribute('data-edit-member');
        const member = data.members.find(m => m.id === memberId);
        if (!member || !form) return;
        form.fullName.value = member.fullName || '';
        form.studentCode.value = member.studentCode || '';
        form.email.value = member.email || '';
        form.phone.value = member.phone || '';
        form.cccd.value = member.cccd || '';
        form.bloodGroup.value = member.bloodGroup || '';
        // Sync account email mirror
        const accEl = byId('memberAccountEmail');
        if (accEl) accEl.value = member.email || '';
        // Populate password from linked user account
        const linkedUser = data.users.find(u => u.memberId === member.id);
        const pwdEl = byId('memberAccountPassword');
        const eyeIcon = byId('memberPasswordEyeIcon');
        if (pwdEl) {
          pwdEl.value = linkedUser?.password || '';
          // Has text → show as plain text (visible), icon = visibility_off to indicate can hide
          pwdEl.type = 'text';
        }
        if (eyeIcon) eyeIcon.textContent = linkedUser?.password ? 'visibility_off' : 'visibility';
        if (editIdInput) editIdInput.value = member.id;
        if (submitBtn) submitBtn.textContent = 'Cập nhật thành viên';
        if (cancelBtn) cancelBtn.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    document.querySelectorAll('[data-del-member]').forEach(btn => {
      btn.addEventListener('click', () => {
        const memberId = btn.getAttribute('data-del-member');
        data.members = data.members.filter(m => m.id !== memberId);
        data.users = data.users.filter(u => u.memberId !== memberId);
        save(data);
        render();
      });
    });
  };

  cancelBtn?.addEventListener('click', resetEditor);

  // Password toggle (eye icon)
  byId('memberPasswordToggle')?.addEventListener('click', () => {
    const pwdEl = byId('memberAccountPassword');
    const eyeIcon = byId('memberPasswordEyeIcon');
    if (!pwdEl || !eyeIcon) return;
    if (pwdEl.type === 'password') {
      pwdEl.type = 'text';
      eyeIcon.textContent = 'visibility_off';
    } else {
      pwdEl.type = 'password';
      eyeIcon.textContent = 'visibility';
    }
  });

  // When password input is empty → auto show (type=text, icon=visibility); when has text keep current toggle state
  byId('memberAccountPassword')?.addEventListener('input', e => {
    const pwdEl = e.target;
    const eyeIcon = byId('memberPasswordEyeIcon');
    if (!pwdEl.value) {
      // No text → revert to visible mode
      pwdEl.type = 'text';
      if (eyeIcon) eyeIcon.textContent = 'visibility';
    } else if (pwdEl.type === 'text' && eyeIcon?.textContent === 'visibility') {
      // First character typed while in default visible state → switch icon to indicate can hide
      eyeIcon.textContent = 'visibility_off';
    }
  });

  // Auto-mirror email → login username input while admin types
  form?.querySelector('[name="email"]')?.addEventListener('input', e => {
    const accEl = byId('memberAccountEmail');
    if (accEl) accEl.value = e.target.value;
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const editId = String(fd.get('editId') || '').trim();
    const accountPassword = String(fd.get('accountPassword') || '').trim();
    const bloodGroupRaw = String(fd.get('bloodGroup') || '').trim();

    // --- Blood group validation ---
    const bgErr = byId('bloodGroupError');
    const notice = byId('memberFormNotice');
    const showNotice = (msg, isError = true) => {
      if (!notice) return;
      notice.textContent = msg;
      notice.className = `text-sm mb-3 ${isError ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}`;
      notice.classList.remove('hidden');
    };
    if (bgErr) bgErr.classList.add('hidden');
    if (bloodGroupRaw && !VALID_BLOOD_GROUPS.has(bloodGroupRaw)) {
      if (bgErr) bgErr.classList.remove('hidden');
      showNotice('Nhóm máu không hợp lệ! Vui lòng chọn đúng danh sách (A, B, O, AB, A+, B+, O+, AB+, A-, B-, O-, AB-).');
      byId('memberBloodGroup')?.focus();
      return;
    }

    const payload = {
      fullName: String(fd.get('fullName') || ''),
      studentCode: String(fd.get('studentCode') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      cccd: String(fd.get('cccd') || ''),
      bloodGroup: bloodGroupRaw || ''
    };

    if (editId) {
      const m = data.members.find(x => x.id === editId);
      if (m) {
        const oldEmail = m.email;
        Object.assign(m, payload);
        const user = data.users.find(u => u.memberId === m.id);
        if (user) {
          if (oldEmail !== m.email) user.email = m.email;
          if (accountPassword) user.password = accountPassword;
        } else if (payload.email) {
          // Create account if member doesn't have one yet
          data.users.push({ id: id('u'), email: payload.email, password: accountPassword || '12345678', role: 'member', memberId: m.id });
        }
      }
    } else {
      const newMember = { id: id('m'), ...payload, joinedAt: new Date().toISOString().slice(0, 10) };
      data.members.push(newMember);
      // Auto-create login account for new member
      if (payload.email && !data.users.some(u => u.email === payload.email)) {
        data.users.push({ id: id('u'), email: payload.email, password: accountPassword || '12345678', role: 'member', memberId: newMember.id });
      }
    }
    save(data);
    resetEditor();
    render();
  });

  render();
}

function initAdminPrograms() {
  if (!roleGuard('admin')) return;
  const data = db();
  byId('adminSidebar').innerHTML = buildAdminSidebar('programs');
  bindLogout('adminLogout', '../');
  const tbody = byId('programsBody');
  const form = byId('programForm');
  const submitBtn = byId('programSubmitBtn');
  const cancelBtn = byId('programCancelEditBtn');
  const editIdInput = byId('programEditId');

  const resetEditor = () => {
    if (editIdInput) editIdInput.value = '';
    if (submitBtn) submitBtn.textContent = 'Tạo chương trình';
    if (cancelBtn) cancelBtn.classList.add('hidden');
    form?.reset();
  };

  const render = () => {
    tbody.innerHTML = data.programs.map(p => `
      <tr class="border-b border-outline-variant/20">
        <td class="py-3">${p.name}</td>
        <td class="py-3">${p.date}</td>
        <td class="py-3">${p.location}</td>
        <td class="py-3">${p.expectedCount}</td>
        <td class="py-3 flex gap-2">
          <button data-edit-program="${p.id}" class="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">Sửa</button>
          <button data-del-program="${p.id}" class="px-3 py-1 rounded-lg bg-error-container text-error text-xs font-bold">Xóa</button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="py-4 text-on-surface-variant">Chưa có chương trình.</td></tr>';

    document.querySelectorAll('[data-edit-program]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-edit-program');
        const p = data.programs.find(x => x.id === pid);
        if (!p || !form) return;
        form.name.value = p.name || '';
        form.date.value = p.date || '';
        form.timeRange.value = p.timeRange || '';
        form.location.value = p.location || '';
        form.expectedCount.value = String(p.expectedCount || 0);
        form.description.value = p.description || '';
        if (editIdInput) editIdInput.value = p.id;
        if (submitBtn) submitBtn.textContent = 'Cập nhật chương trình';
        if (cancelBtn) cancelBtn.classList.remove('hidden');
      });
    });

    document.querySelectorAll('[data-del-program]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-del-program');
        data.programs = data.programs.filter(p => p.id !== pid);
        save(data);
        render();
      });
    });
  };

  cancelBtn?.addEventListener('click', resetEditor);

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const editId = String(fd.get('editId') || '').trim();
    const payload = {
      name: String(fd.get('name') || ''),
      date: String(fd.get('date') || ''),
      timeRange: String(fd.get('timeRange') || ''),
      location: String(fd.get('location') || ''),
      expectedCount: Number(fd.get('expectedCount') || 0),
      description: String(fd.get('description') || ''),
      status: 'upcoming'
    };

    if (editId) {
      const p = data.programs.find(x => x.id === editId);
      if (p) Object.assign(p, payload);
    } else {
      data.programs.push({ id: id('p'), ...payload });
    }
    save(data);
    resetEditor();
    render();
  });

  render();
}

function initAdminRegistrations() {
  const a = roleGuard('admin');
  if (!a) return;
  const data = db();
  byId('adminSidebar').innerHTML = buildAdminSidebar('registrations');
  bindLogout('adminLogout', '../');
  const tbody = byId('registrationsBody');
  const statTotal = byId('statTotalRegs');
  const statActual = byId('statActualPeople');
  const statApprove = byId('statApproveRate');
  const statReject = byId('statRejectRate');
  const statBody = byId('statsByProgramBody');

  const updateHistoryStatus = (registrationId, status) => {
    const h = data.history.find(x => x.registrationId === registrationId);
    if (h) h.status = status;
  };

  const render = () => {
    const total = data.registrations.length;
    const approved = data.registrations.filter(r => r.status === 'DaDuyet').length;
    const rejected = data.registrations.filter(r => r.status === 'TuChoi').length;
    const participated = data.history.filter(h => h.participated).length;
    if (statTotal) statTotal.textContent = String(total);
    if (statActual) statActual.textContent = String(participated);
    if (statApprove) statApprove.textContent = `${total ? Math.round((approved / total) * 100) : 0}%`;
    if (statReject) statReject.textContent = `${total ? Math.round((rejected / total) * 100) : 0}%`;

    if (statBody) {
      statBody.innerHTML = data.programs.map(p => {
        const regs = data.registrations.filter(r => r.programId === p.id);
        const actual = data.history.filter(h => h.programId === p.id && h.participated).length;
        const ok = regs.filter(r => r.status === 'DaDuyet').length;
        const no = regs.filter(r => r.status === 'TuChoi').length;
        return `
          <tr class="border-b border-outline-variant/20">
            <td class="py-2">${p.name}</td>
            <td class="py-2">${regs.length}</td>
            <td class="py-2">${actual}</td>
            <td class="py-2">${regs.length ? Math.round((ok / regs.length) * 100) : 0}% / ${regs.length ? Math.round((no / regs.length) * 100) : 0}%</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="4" class="py-3 text-on-surface-variant">Chưa có dữ liệu.</td></tr>';
    }

    tbody.innerHTML = data.registrations.map(r => `
      <tr class="border-b border-outline-variant/20">
        <td class="py-3">${r.fullName}</td>
        <td class="py-3">${r.studentCode || '-'}</td>
        <td class="py-3">${programName(data, r.programId)}</td>
        <td class="py-3">${r.bloodGroup || '-'}</td>
        <td class="py-3">${r.status}</td>
        <td class="py-3 flex gap-2">
          <button data-approve="${r.id}" class="px-3 py-1 rounded-lg bg-tertiary-fixed text-tertiary text-xs font-bold">Duyệt</button>
          <button data-reject="${r.id}" class="px-3 py-1 rounded-lg bg-error-container text-error text-xs font-bold">Từ chối</button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="py-4 text-on-surface-variant">Chưa có đơn đăng ký.</td></tr>';

    document.querySelectorAll('[data-approve]').forEach(btn => btn.addEventListener('click', () => {
      const idReg = btn.getAttribute('data-approve');
      const reg = data.registrations.find(x => x.id === idReg);
      if (!reg) return;
      reg.status = 'DaDuyet';
      reg.reviewedBy = a.userId;
      reg.reviewedAt = new Date().toISOString();
      updateHistoryStatus(idReg, 'DaDuyet');
      save(data);
      render();
    }));

    document.querySelectorAll('[data-reject]').forEach(btn => btn.addEventListener('click', () => {
      const idReg = btn.getAttribute('data-reject');
      const reg = data.registrations.find(x => x.id === idReg);
      if (!reg) return;
      reg.status = 'TuChoi';
      reg.reviewedBy = a.userId;
      reg.reviewedAt = new Date().toISOString();
      updateHistoryStatus(idReg, 'TuChoi');
      save(data);
      render();
    }));

  };

  render();
}

function initAdminNotifications() {
  if (!roleGuard('admin')) return;
  const data = db();
  byId('adminSidebar').innerHTML = buildAdminSidebar('notifications');
  bindLogout('adminLogout', '../');
  const form = byId('notifyForm');
  const tbody = byId('notificationsBody');
  const submitBtn = byId('notifySubmitBtn');
  const editIdInput = byId('notifyEditId');
  const cancelBtn = byId('notifyCancelEditBtn');

  const resetEditor = () => {
    if (editIdInput) editIdInput.value = '';
    if (submitBtn) submitBtn.textContent = 'Lưu thông báo';
    if (cancelBtn) cancelBtn.classList.add('hidden');
    form?.reset();
  };

  const render = () => {
    tbody.innerHTML = data.notifications.map(n => `
      <tr class="border-b border-outline-variant/20">
        <td class="py-3">${n.title}</td>
        <td class="py-3">${n.content}</td>
        <td class="py-3">${toDateText(n.createdAt)}</td>
        <td class="py-3">${n.isSent === false ? 'Bản nháp' : 'Đã gửi'}</td>
        <td class="py-3 flex gap-2">
          <button data-edit-noti="${n.id}" class="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">Sửa</button>
          ${n.isSent === false ? `<button data-send-noti="${n.id}" class="px-3 py-1 rounded-lg bg-tertiary-fixed text-tertiary text-xs font-bold">Gửi</button>` : ''}
          <button data-del-noti="${n.id}" class="px-3 py-1 rounded-lg bg-error-container text-error text-xs font-bold">Xóa</button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="py-4 text-on-surface-variant">Chưa có thông báo.</td></tr>';

    document.querySelectorAll('[data-edit-noti]').forEach(btn => btn.addEventListener('click', () => {
      const idN = btn.getAttribute('data-edit-noti');
      const item = data.notifications.find(n => n.id === idN);
      if (!item || !form) return;
      form.title.value = item.title || '';
      form.content.value = item.content || '';
      if (editIdInput) editIdInput.value = item.id;
      if (submitBtn) submitBtn.textContent = 'Cập nhật thông báo';
      if (cancelBtn) cancelBtn.classList.remove('hidden');
    }));

    document.querySelectorAll('[data-send-noti]').forEach(btn => btn.addEventListener('click', () => {
      const idN = btn.getAttribute('data-send-noti');
      const item = data.notifications.find(n => n.id === idN);
      if (!item) return;
      item.isSent = true;
      item.sentAt = new Date().toISOString();
      item.createdAt = item.sentAt;
      save(data);
      render();
    }));

    document.querySelectorAll('[data-del-noti]').forEach(btn => btn.addEventListener('click', () => {
      const idN = btn.getAttribute('data-del-noti');
      data.notifications = data.notifications.filter(n => n.id !== idN);
      save(data);
      render();
    }));
  };

  cancelBtn?.addEventListener('click', resetEditor);

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const editId = String(fd.get('editId') || '').trim();
    const content = String(fd.get('content') || '');
    const payload = {
      title: String(fd.get('title') || ''),
      summary: content.slice(0, 180),
      content
    };

    if (editId) {
      const n = data.notifications.find(x => x.id === editId);
      if (n) Object.assign(n, payload);
    } else {
      data.notifications.unshift({
        id: id('n'),
        ...payload,
        createdAt: new Date().toISOString(),
        sentBy: auth()?.userId || 'u_admin',
        attachmentLabel: '',
        attachmentUrl: '',
        conditions: [],
        notes: [],
        isSent: false,
        sentAt: null,
        targetRole: 'member'
      });
    }
    save(data);
    resetEditor();
    render();
  });

  render();
}

function initAdminAccounts() {
  if (!roleGuard('admin')) return;
  const data = db();
  byId('adminSidebar').innerHTML = buildAdminSidebar('accounts');
  bindLogout('adminLogout', '../');
  const form = byId('accountForm');
  const tbody = byId('accountsBody');
  const avatarInput = byId('accountAvatar');
  const avatarPreview = byId('avatarPreview');
  const avatarPlaceholder = byId('avatarPlaceholder');
  let pendingAvatarDataUrl = '';

  // Handle avatar file selection — convert to base64 via FileReader
  avatarInput?.addEventListener('change', () => {
    const file = avatarInput.files?.[0];
    if (!file) { pendingAvatarDataUrl = ''; return; }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB.');
      avatarInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      pendingAvatarDataUrl = ev.target.result;
      if (avatarPreview) {
        avatarPreview.src = pendingAvatarDataUrl;
        avatarPreview.classList.remove('hidden');
      }
      if (avatarPlaceholder) avatarPlaceholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  });

  const render = () => {
    const users = data.users.filter(u => u.role === 'member');
    tbody.innerHTML = users.map(u => `
      <tr class="border-b border-outline-variant/20">
        <td class="py-3">
          <div class="flex items-center gap-3">
            ${u.avatar
              ? `<img src="${u.avatar}" alt="" class="w-8 h-8 rounded-full object-cover flex-shrink-0" />`
              : `<span class="material-symbols-outlined text-on-surface-variant" style="font-size:2rem;">account_circle</span>`}
            <span>${u.email}</span>
          </div>
        </td>
        <td class="py-3">Member</td>
        <td class="py-3"><button data-reset="${u.id}" class="px-3 py-1 rounded-lg bg-surface-container-low text-xs font-bold">Cấp lại 12345678</button></td>
      </tr>
    `).join('') || '<tr><td colspan="3" class="py-4 text-on-surface-variant">Chưa có tài khoản Member.</td></tr>';

    document.querySelectorAll('[data-reset]').forEach(btn => btn.addEventListener('click', () => {
      const uid = btn.getAttribute('data-reset');
      const u = data.users.find(x => x.id === uid);
      if (!u) return;
      u.password = '12345678';
      save(data);
      alert('Đã cấp lại mật khẩu về 12345678');
    }));
  };

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '').trim();
    const member = data.members.find(m => m.email === email);
    if (!member) {
      alert('Email này chưa tồn tại trong danh sách thành viên. Vui lòng thêm thành viên trước.');
      return;
    }
    if (data.users.some(u => u.email === email)) {
      alert('Tài khoản đã tồn tại.');
      return;
    }
    const newUser = { id: id('u'), email, password: password || '12345678', role: 'member', memberId: member.id };
    if (pendingAvatarDataUrl) newUser.avatar = pendingAvatarDataUrl;
    data.users.push(newUser);
    save(data);
    form.reset();
    pendingAvatarDataUrl = '';
    if (avatarPreview) { avatarPreview.src = ''; avatarPreview.classList.add('hidden'); }
    if (avatarPlaceholder) avatarPlaceholder.classList.remove('hidden');
    render();
  });

  render();
}

function buildMemberSidebar(active) {
  return `
    <aside class="sidebar bg-slate-50 p-6 sticky top-0 self-start lg:h-screen max-h-screen overflow-y-auto z-40">
      <div class="sidebar-header flex justify-between items-center w-full">
        <h1 class="sidebar-title font-headline font-extrabold text-xl text-primary">CLB Hiến Máu Khoa Học</h1>
        <button type="button" class="sidebar-toggle lg:hidden p-2 rounded-lg text-primary focus:outline-none bg-slate-200" onclick="document.getElementById('memberSidebarContent').classList.toggle('hidden');">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
      <div id="memberSidebarContent" class="sidebar-content hidden lg:block w-full">
        <nav class="sidebar-nav mt-8 space-y-1 text-sm">
          <a class="block px-4 py-3 rounded-xl ${active === 'dashboard' ? 'bg-white text-primary font-bold' : 'hover:bg-white'}" href="dashboard.html">Tổng quan</a>
          <a class="block px-4 py-3 rounded-xl ${active === 'profile' ? 'bg-white text-primary font-bold' : 'hover:bg-white'}" href="profile.html">Cá nhân</a>
          <a class="block px-4 py-3 rounded-xl ${active === 'notifications' ? 'bg-white text-primary font-bold' : 'hover:bg-white'}" href="notifications.html">Thông báo</a>
          <a class="block px-4 py-3 rounded-xl ${active === 'history' ? 'bg-white text-primary font-bold' : 'hover:bg-white'}" href="history.html">Lịch sử</a>
        </nav>
        <div class="sidebar-actions mt-8 lg:mt-0">
          <a href="../register.html" class="mt-8 inline-block signature-gradient px-4 py-2 rounded-xl text-white text-sm font-bold">Đăng ký hiến máu</a>
          <button id="memberLogout" class="mt-3 px-4 py-2 rounded-xl bg-white text-sm font-semibold">Đăng xuất</button>
        </div>
      </div>
    </aside>
  `;
}

function memberContext() {
  const a = roleGuard('member');
  if (!a) return null;
  const data = db();
  const member = data.members.find(m => m.id === a.memberId);
  return member ? { a, data, member } : null;
}

function initMemberDashboard() {
  const ctx = memberContext();
  if (!ctx) return;
  const { data, member } = ctx;
  byId('memberSidebar').innerHTML = buildMemberSidebar('dashboard');
  bindLogout('memberLogout', '../');
  byId('memberName').textContent = member.fullName;
  byId('memberBlood').textContent = member.bloodGroup || 'Chưa biết';
  const myHistory = data.history.filter(h => h.personKey === member.cccd || h.personKey === member.phone || h.fullName === member.fullName);
  byId('memberTotalDonations').textContent = String(myHistory.filter(h => h.participated).length);
  byId('memberPending').textContent = String(myHistory.filter(h => h.status === 'ChoDuyet').length);
  const visibleNotifications = data.notifications.filter(n => n.isSent !== false && (n.targetRole || 'member') === 'member');
  byId('memberNoti').textContent = String(visibleNotifications.length);

  const activity = byId('memberActivities');
  const viewport = byId('memberActivitiesViewport');
  const prevBtn = byId('memberActivitiesPrev');
  const nextBtn = byId('memberActivitiesNext');
  if (activity && viewport) {
    const now = Date.now();
    const upcoming = data.programs
      .filter(p => canRegisterProgram(p, now))
      .sort((a, b) => programTimeline(a).startAt - programTimeline(b).startAt);

    activity.innerHTML = upcoming.map(p => `
      <article class="rounded-xl p-4 bg-surface-container-low home-carousel-item member-activity-item">
        <h4 class="font-bold">${p.name}</h4>
        <p class="text-sm text-on-surface-variant mt-1">${p.date} - ${p.location}</p>
      </article>
    `).join('') || '<p class="text-on-surface-variant">Không có hoạt động CLB sắp tới.</p>';

    if (!upcoming.length) {
      prevBtn?.classList.add('hidden');
      nextBtn?.classList.add('hidden');
      return;
    }

    const getVisibleCount = () => {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    };

    let currentIndex = 0;

    const itemStep = () => {
      const firstItem = activity.querySelector('.member-activity-item');
      if (!firstItem) return 0;
      const style = getComputedStyle(firstItem);
      const marginRight = parseFloat(style.marginRight || '0');
      return firstItem.getBoundingClientRect().width + marginRight;
    };

    const maxIndex = () => Math.max(0, upcoming.length - getVisibleCount());

    const updateButtons = () => {
      if (upcoming.length <= getVisibleCount()) {
        prevBtn?.classList.add('hidden');
        nextBtn?.classList.add('hidden');
        return;
      }
      prevBtn?.classList.remove('hidden');
      nextBtn?.classList.remove('hidden');
      if (prevBtn) prevBtn.disabled = currentIndex <= 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex();
    };

    const slideTo = index => {
      currentIndex = Math.max(0, Math.min(maxIndex(), index));
      activity.style.transform = `translateX(-${currentIndex * itemStep()}px)`;
      updateButtons();
    };

    prevBtn?.addEventListener('click', () => slideTo(currentIndex - 1));
    nextBtn?.addEventListener('click', () => slideTo(currentIndex + 1));
    window.addEventListener('resize', () => slideTo(currentIndex));
    slideTo(0);
  }
}

function initMemberProfile() {
  const ctx = memberContext();
  if (!ctx) return;
  const { data, member } = ctx;
  byId('memberSidebar').innerHTML = buildMemberSidebar('profile');
  bindLogout('memberLogout', '../');

  const form = byId('profileForm');
  form.fullName.value = member.fullName || '';
  form.studentCode.value = member.studentCode || '';
  form.email.value = member.email || '';
  form.phone.value = member.phone || '';
  form.cccd.value = member.cccd || '';
  form.bloodGroup.value = member.bloodGroup || '';

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    member.fullName = String(fd.get('fullName') || '');
    member.studentCode = String(fd.get('studentCode') || '');
    member.email = String(fd.get('email') || '');
    member.phone = String(fd.get('phone') || '');
    member.cccd = String(fd.get('cccd') || '');
    member.bloodGroup = String(fd.get('bloodGroup') || '');
    save(data);
    byId('profileNotice').textContent = 'Cập nhật thông tin thành công.';
  });
}

function initMemberNotifications() {
  const ctx = memberContext();
  if (!ctx) return;
  const { data, member } = ctx;
  byId('memberSidebar').innerHTML = buildMemberSidebar('notifications');
  bindLogout('memberLogout', '../');
  const list = byId('memberNotificationsList');
  const detail = byId('memberNotificationDetail');
  const visibleNotifications = data.notifications
    .filter(n => n.isSent !== false && (n.targetRole || 'member') === 'member')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  let selectedId = visibleNotifications[0]?.id || null;

  const markSeen = idNoti => {
    const exists = data.notificationReads.some(r => r.memberId === member.id && r.notificationId === idNoti);
    if (!exists) {
      data.notificationReads.push({ memberId: member.id, notificationId: idNoti, seenAt: new Date().toISOString() });
      save(data);
    }
  };

  const renderDetail = current => {
    if (!current) {
      detail.innerHTML = '<p class="text-on-surface-variant">Chưa có thông báo.</p>';
      return;
    }

    const related = visibleNotifications.filter(n => n.id !== current.id).slice(0, 8);
    detail.innerHTML = `
      <h3>THÔNG BÁO</h3>
      <div class="detail-time">[${toDateText(current.createdAt)}]</div>
      <h4 class="mt-4 font-headline text-2xl font-bold text-[#2f64b8]">${current.title}</h4>
      <p class="mt-2 text-on-surface-variant">${current.summary || ''}</p>
      <p class="mt-4">${current.content || ''}</p>
      ${current.attachmentLabel ? `<a class="noti-attachment" href="${current.attachmentUrl || '#'}">${current.attachmentLabel}</a>` : ''}
      ${current.conditions?.length ? `<div class="mt-4"><strong>* Điều kiện / nội dung chính:</strong><ol class="mt-2" style="padding-left:18px;">${current.conditions.map(c => `<li style="margin-bottom:6px;">${c}</li>`).join('')}</ol></div>` : ''}
      ${current.notes?.length ? `<div class="mt-4"><strong>Lưu ý:</strong><ul class="mt-2" style="padding-left:18px;">${current.notes.map(n => `<li style="margin-bottom:6px;">${n}</li>`).join('')}</ul></div>` : ''}
      <div class="mt-6">
        <strong>Các thông báo khác:</strong>
        <ul class="noti-related mt-2" style="padding-left:18px;">
          ${related.map(n => `<li><a href="#" data-related="${n.id}">${n.title}</a> <span style="color:#6b7280;">(${toDateText(n.createdAt)})</span></li>`).join('') || '<li>Không có</li>'}
        </ul>
      </div>
    `;

    detail.querySelectorAll('[data-related]').forEach(aNode => {
      aNode.addEventListener('click', e => {
        e.preventDefault();
        selectedId = aNode.getAttribute('data-related');
        markSeen(selectedId);
        render();
      });
    });
  };

  const render = () => {
    const sorted = [...visibleNotifications];
    if (!selectedId && sorted.length) selectedId = sorted[0].id;

    list.innerHTML = sorted.map((n, idx) => {
      const seen = data.notificationReads.some(r => r.memberId === member.id && r.notificationId === n.id);
      return `
        <article class="noti-item stagger-item ${selectedId === n.id ? 'active' : ''}" style="--stagger:${idx};" data-noti-item="${n.id}">
          <div class="noti-item-title">${n.title}</div>
          <div class="noti-item-time">[${toDateText(n.createdAt)}]</div>
          <div class="noti-item-summary">${n.summary || ''}</div>
          <div class="mt-2">${seen ? '<span class="tag tag-ok">Đã xem</span>' : '<span class="tag tag-pending">Chưa xem</span>'}</div>
        </article>
      `;
    }).join('') || '<div class="p-4 text-on-surface-variant">Chưa có thông báo.</div>';

    list.querySelectorAll('[data-noti-item]').forEach(item => {
      item.addEventListener('click', () => {
        selectedId = item.getAttribute('data-noti-item');
        markSeen(selectedId);
        render();
      });
    });

    const current = sorted.find(n => n.id === selectedId) || sorted[0];
    renderDetail(current);
  };

  if (selectedId) markSeen(selectedId);
  render();
}

function initMemberHistory() {
  const ctx = memberContext();
  if (!ctx) return;
  const { data, member } = ctx;
  byId('memberSidebar').innerHTML = buildMemberSidebar('history');
  bindLogout('memberLogout', '../');
  const tbody = byId('memberHistoryBody');
  const form = byId('memberHistorySearchForm');
  const input = byId('memberHistorySearchKey');
  const cards = byId('memberHistoryCards');
  const totalNode = byId('memberHistoryTotal');
  const latestNode = byId('memberHistoryLatest');
  const statusNode = byId('memberHistoryStatus');
  const hintNode = byId('memberHistoryHint');
  if (!tbody || !form || !input) return;

  const allRows = data.history.filter(h => h.personKey === member.cccd || h.personKey === member.phone || h.fullName === member.fullName);

  const statusLabel = status => {
    if (status === 'DaDuyet') return 'Đã duyệt';
    if (status === 'ChoDuyet') return 'Chờ duyệt';
    if (status === 'TuChoi') return 'Từ chối';
    return status || 'Không xác định';
  };

  const statusClass = status => {
    if (status === 'DaDuyet') return 'approved';
    if (status === 'ChoDuyet') return 'pending';
    if (status === 'TuChoi') return 'rejected';
    return 'default';
  };

  const resetStats = () => {
    if (totalNode) totalNode.textContent = '0';
    if (latestNode) latestNode.textContent = '-';
    if (statusNode) statusNode.textContent = '-';
  };

  const renderEmpty = message => {
    tbody.innerHTML = `<tr><td colspan="5" class="py-5 text-on-surface-variant">${message}</td></tr>`;
    if (cards) cards.innerHTML = `<article class="lookup-empty">${message}</article>`;
  };

  const render = key => {
    let rows = allRows;
    const normalized = String(key || '').trim();
    if (normalized) {
      const isOwnKey = normalized === (member.cccd || '') || normalized === (member.phone || '');
      rows = isOwnKey ? allRows : [];
    } else {
      rows = [];
    }

    if (!normalized) {
      if (hintNode) hintNode.textContent = 'Nhập CCCD hoặc SĐT để bắt đầu.';
      renderEmpty('Nhập CCCD hoặc SĐT của bạn để tra cứu lịch sử hiến máu.');
      resetStats();
      return;
    }

    if (!rows.length) {
      if (hintNode) hintNode.textContent = 'Không tìm thấy dữ liệu phù hợp.';
      renderEmpty('Không tìm thấy lịch sử với CCCD/SĐT đã nhập.');
      resetStats();
      return;
    }

    if (hintNode) hintNode.textContent = `Tìm thấy ${rows.length} bản ghi.`;
    const donatedRows = rows.filter(h => h.participated);
    if (totalNode) totalNode.textContent = String(donatedRows.length);

    const rowsWithDate = rows
      .map(h => ({ ...h, _time: new Date(h.donatedAt || 0).getTime() }))
      .sort((a, b) => b._time - a._time);
    const latest = rowsWithDate[0];
    if (latestNode) latestNode.textContent = latest?.donatedAt ? toDateText(latest.donatedAt) : 'Chưa có';
    if (statusNode) statusNode.textContent = statusLabel(latest?.status);

    tbody.innerHTML = rows.map((h, idx) => `
      <tr class="border-b border-outline-variant/20">
        <td class="py-3">Lần ${idx + 1}</td>
        <td class="py-3">${programName(data, h.programId)}</td>
        <td class="py-3"><span class="lookup-status-badge ${statusClass(h.status)}">${statusLabel(h.status)}</span></td>
        <td class="py-3">${h.participated ? 'Có' : 'Chưa'}</td>
        <td class="py-3">${h.donatedAt ? toDateText(h.donatedAt) : '-'}</td>
      </tr>
    `).join('');

    if (cards) {
      cards.innerHTML = rows.map((h, idx) => `
        <article class="lookup-card">
          <p class="lookup-card-title">Lần ${idx + 1}</p>
          <p class="lookup-card-meta">${programName(data, h.programId)}</p>
          <div class="mt-2"><span class="lookup-status-badge ${statusClass(h.status)}">${statusLabel(h.status)}</span></div>
          <p class="lookup-card-meta mt-2">Tham gia thực tế: ${h.participated ? 'Có' : 'Chưa'}</p>
          <p class="lookup-card-meta">Ngày hiến: ${h.donatedAt ? toDateText(h.donatedAt) : '-'}</p>
        </article>
      `).join('');
    }
  };

  form?.addEventListener('submit', e => {
    e.preventDefault();
    render(input?.value || '');
  });

  render('');
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resetProgramsAndNotificationsToVietnameseRandom() {
  if (localStorage.getItem(VI_RESET_KEY) === 'done') return;

  const data = db();
  const locations = [
    'Sảnh A - Cơ sở chính',
    'Hội trường B2',
    'Nhà Văn hóa Sinh viên',
    'Quảng trường Trung tâm',
    'Khu Y tế học đường',
    'Trung tâm Thể thao sinh viên',
    'Nhà học đa năng D1'
  ];
  const programThemes = [
    'Giọt hồng nhân ái',
    'Kết nối yêu thương',
    'Vì cộng đồng khỏe mạnh',
    'Trao máu - Trao hy vọng',
    'Tuổi trẻ sẻ chia',
    'Chung tay vì sự sống'
  ];
  const campaignTypes = ['Ngày hội', 'Chương trình', 'Đợt vận động', 'Sự kiện'];

  const notificationSubjects = [
    'lịch tiếp nhận',
    'hướng dẫn trước hiến máu',
    'kết quả sau hiến máu',
    'điều phối tình nguyện viên',
    'cập nhật quy trình',
    'nhắc lịch tham gia',
    'vinh danh thành viên tích cực',
    'đăng ký hỗ trợ hậu cần'
  ];
  const notificationActions = [
    'Vui lòng theo dõi chi tiết và thực hiện đúng hướng dẫn để đảm bảo an toàn.',
    'Đề nghị thành viên xác nhận tham gia trước thời hạn được thông báo.',
    'Ban tổ chức sẽ ưu tiên xử lý các đăng ký sớm và đầy đủ thông tin.',
    'Mọi thắc mắc vui lòng liên hệ bộ phận điều phối của CLB để được hỗ trợ.',
    'Nội dung chi tiết đã được cập nhật trên hệ thống và bảng tin điện tử.'
  ];

  const newPrograms = [];
  for (let i = 1; i <= 10; i += 1) {
    const offset = randomInt(2, 120);
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const date = d.toISOString().slice(0, 10);
    const startHour = randomInt(7, 11);
    const endHour = randomInt(startHour + 4, Math.min(startHour + 7, 19));
    const timeRange = `${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00`;
    const campaign = campaignTypes[randomInt(0, campaignTypes.length - 1)];
    const theme = programThemes[randomInt(0, programThemes.length - 1)];
    newPrograms.push({
      id: `p_vi_${i}`,
      name: `${campaign} hiến máu ${theme} ${i}`,
      date,
      timeRange,
      location: locations[randomInt(0, locations.length - 1)],
      expectedCount: randomInt(120, 420),
      description: 'Chương trình được tạo ngẫu nhiên nhằm mô phỏng hoạt động hiến máu của CLB trong năm học.',
      status: 'upcoming',
      autoSeed: true,
      isRandomVietnamese: true
    });
  }

  const endedA = new Date();
  endedA.setDate(endedA.getDate() - randomInt(25, 50));
  const endedB = new Date();
  endedB.setDate(endedB.getDate() - randomInt(55, 85));

  newPrograms.push(
    {
      id: 'p_vi_ended_1',
      name: 'Chương trình hiến máu Hành Trình Đỏ đã kết thúc',
      date: endedA.toISOString().slice(0, 10),
      timeRange: '08:00-15:30',
      location: 'Sảnh hội trường trung tâm',
      expectedCount: randomInt(160, 260),
      description: 'Chương trình đã hoàn tất tiếp nhận hiến máu và đóng cổng đăng ký.',
      status: 'ended',
      autoSeed: true,
      isRandomVietnamese: true
    },
    {
      id: 'p_vi_ended_2',
      name: 'Ngày hội hiến máu Kết Nối Trái Tim đã kết thúc',
      date: endedB.toISOString().slice(0, 10),
      timeRange: '09:00-16:00',
      location: 'Nhà văn hóa sinh viên',
      expectedCount: randomInt(180, 300),
      description: 'Sự kiện đã khép lại, dữ liệu tham gia được lưu vào lịch sử hệ thống.',
      status: 'ended',
      autoSeed: true,
      isRandomVietnamese: true
    }
  );

  const newNotifications = [];
  for (let i = 1; i <= 10; i += 1) {
    const createdAt = new Date(Date.now() - i * 86400000).toISOString();
    const subject = notificationSubjects[randomInt(0, notificationSubjects.length - 1)];
    const action = notificationActions[randomInt(0, notificationActions.length - 1)];
    const title = `Thông báo ${i}: Cập nhật ${subject}`;
    const summary = `CLB cập nhật nội dung về ${subject} để thành viên và người tham gia nắm thông tin kịp thời.`;
    const content = `Ban tổ chức thông báo nội dung mới liên quan đến ${subject}. ${action}`;
    newNotifications.push({
      id: `n_vi_${i}`,
      title,
      summary,
      content,
      createdAt,
      sentBy: 'u_admin',
      attachmentLabel: i % 2 === 0 ? 'Xem chi tiết thông báo' : '',
      attachmentUrl: i % 2 === 0 ? '#' : '',
      conditions: i % 3 === 0 ? ['Đảm bảo cập nhật thông tin cá nhân trước khi tham gia.', 'Thực hiện đúng khung giờ đã đăng ký.'] : [],
      notes: i % 2 !== 0 ? ['Nếu có thay đổi đột xuất, hệ thống sẽ gửi thông báo bổ sung.'] : [],
      isSent: true,
      sentAt: createdAt,
      targetRole: 'member',
      isRandomVietnamese: true
    });
  }

  data.programs = newPrograms;
  data.notifications = newNotifications;
  data.notificationReads = [];

  save(data);
  localStorage.setItem(VI_RESET_KEY, 'done');
}

function start() {
  ensureDefaultMemberAccount();
  resetProgramsAndNotificationsToVietnameseRandom();
  ensureNotificationSchema();
  ensureExtraSeedData();
  bindAuthPopupTriggers();
  bindPageTransitions();
  const page = document.body.getAttribute('data-page');
  if (!page) return;
  if (page === 'home') initHome();
  if (page === 'programs') initPrograms();
  if (page === 'register') initRegister();
  if (page === 'lookup') initLookup();
  if (page === 'login') initLogin();
  if (page === 'admin-dashboard') initAdminDashboard();
  if (page === 'admin-members') initAdminMembers();
  if (page === 'admin-programs') initAdminPrograms();
  if (page === 'admin-registrations') initAdminRegistrations();
  if (page === 'admin-notifications') initAdminNotifications();

  if (page === 'member-dashboard') initMemberDashboard();
  if (page === 'member-profile') initMemberProfile();
  if (page === 'member-notifications') initMemberNotifications();
  if (page === 'member-history') initMemberHistory();
}

document.addEventListener('DOMContentLoaded', start);








