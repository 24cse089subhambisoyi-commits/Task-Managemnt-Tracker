
const USERS_KEY   = 'tmt-users';
const SESSION_KEY = 'tmt-session';

let currentTab = 'login';

function getUsers()       { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
function saveUsers(u)     { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function getSession()     { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
function saveSession(u)   { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
function clearSession()   { localStorage.removeItem(SESSION_KEY); }

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.querySelectorAll('.name-only').forEach(el => {
    el.style.display = tab === 'signup' ? 'block' : 'none';
  });
  document.getElementById('btn-label').textContent = tab === 'login' ? '🔑 Login' : '✨ Create Account';
  const heading = document.getElementById('login-heading');
  if (heading) heading.textContent = tab === 'login' ? 'Welcome Back 👋' : 'Create Account 🚀';
  hideError();
  clearHints();
}


function setHint(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `field-hint show ${type}`;
  const inp = document.getElementById(id.replace('hint-', 'inp-'));
  if (inp) inp.className = 'login-input ' + (type === 'ok' ? 'valid' : type === 'err' ? 'error' : '');
}
function clearHints() {
  ['hint-name', 'hint-email', 'hint-pwd'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.className = 'field-hint'; el.textContent = ''; }
  });
  ['inp-name', 'inp-email', 'inp-pwd'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'login-input';
  });
}
function showError(msg) {
  document.getElementById('error-text').textContent = msg;
  const el = document.getElementById('login-error');
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}
function hideError() {
  const el = document.getElementById('login-error');
  if (el) el.classList.remove('show');
}

function validateName() {
  const v = document.getElementById('inp-name').value.trim();
  if (!v)        { setHint('hint-name', 'Name is required', 'err'); return false; }
  if (v.length < 2) { setHint('hint-name', 'At least 2 characters', 'err'); return false; }
  setHint('hint-name', '✓ Looks good', 'ok'); return true;
}
function validateEmail() {
  const v  = document.getElementById('inp-email').value.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!v)         { setHint('hint-email', 'Email is required', 'err'); return false; }
  if (!re.test(v)){ setHint('hint-email', 'Enter a valid email address', 'err'); return false; }
  setHint('hint-email', '✓ Valid email', 'ok'); return true;
}
function validatePwd() {
  const v = document.getElementById('inp-pwd').value;
  if (!v)        { setHint('hint-pwd', 'Password is required', 'err'); updateBar(0); return false; }
  if (v.length < 6) { setHint('hint-pwd', `Need ${6 - v.length} more character${6 - v.length === 1 ? '' : 's'}`, 'err'); updateBar(v.length); return false; }
  setHint('hint-pwd', '✓ Password OK', 'ok'); updateBar(v.length); return true;
}

function updateBar(len) {
  if (currentTab !== 'signup') return;
  const bar = document.getElementById('pwd-bar');
  const lbl = document.getElementById('pwd-bar-label');
  if (!bar || !lbl) return;
  let pct = 0, color = '', txt = '';
  if      (len === 0) { pct = 0;   color = 'var(--border)'; txt = '—'; }
  else if (len < 6)   { pct = Math.round(len / 10 * 100); color = 'var(--red)';    txt = 'Too short'; }
  else if (len < 8)   { pct = 50;  color = 'var(--orange)'; txt = 'Weak'; }
  else if (len < 12)  { pct = 75;  color = 'var(--blue)';   txt = 'Good'; }
  else                { pct = 100; color = 'var(--green)';  txt = 'Strong 💪'; }
  bar.style.width      = pct + '%';
  bar.style.background = color;
  lbl.textContent      = 'Strength: ' + txt;
  lbl.style.color      = color;
}


function toggleEye() {
  const inp  = document.getElementById('inp-pwd');
  const btn  = document.getElementById('eye-btn');
  const show = inp.type === 'password';
  inp.type       = show ? 'text' : 'password';
  btn.textContent = show ? '🙈' : '👁️';
}


function handleSubmit() {
  hideError();
  const email = document.getElementById('inp-email').value.trim().toLowerCase();
  const pwd   = document.getElementById('inp-pwd').value;

  const eOk = validateEmail();
  const pOk = validatePwd();

  if (currentTab === 'signup') {
    const nOk = validateName();
    if (!nOk || !eOk || !pOk) { showError('Please fix the errors above.'); return; }

    const name  = document.getElementById('inp-name').value.trim();
    const users = getUsers();
    if (users[email]) { showError('An account with this email already exists. Try logging in.'); return; }

    users[email] = { name, email, pwd };
    saveUsers(users);
    loginSuccess({ name, email });

  } else {
    if (!eOk || !pOk) { showError('Please fix the errors above.'); return; }

    const users = getUsers();
    if (!users[email])           { showError('No account found. Sign up first!'); return; }
    if (users[email].pwd !== pwd){ showError('Incorrect password. Try again.'); return; }

    loginSuccess(users[email]);
  }
}

function loginSuccess(user) {
  saveSession(user);
  const overlay = document.getElementById('success-overlay');
  document.getElementById('success-msg').textContent =
    currentTab === 'signup' ? `Welcome, ${user.name}! 🎉` : `Welcome back, ${user.name}! 👋`;
  overlay.classList.add('show');
  
  setTimeout(() => { window.location.href = 'index.html'; }, 1800);
}

function doLogout() {
  clearSession();
  window.location.href = 'login.html';
}


document.addEventListener('keydown', e => {
  const loginPage = document.getElementById('login-page');
  if (e.key === 'Enter' && loginPage &&
      getComputedStyle(loginPage).display !== 'none') {
    handleSubmit();
  }
});


let tasks   = JSON.parse(localStorage.getItem('tmt-tasks') || '[]');
let filter  = 'all';
let editing = null;

function save() { localStorage.setItem('tmt-tasks', JSON.stringify(tasks)); }

function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className  = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function openModal(id = null) {
  editing = id;
  document.getElementById('modal-title').textContent = id ? 'Edit Task' : 'Add New Task';
  const task = id ? tasks.find(t => t.id === id) : null;
  document.getElementById('f-title').value    = task ? task.title    : '';
  document.getElementById('f-desc').value     = task ? task.desc     : '';
  document.getElementById('f-status').value   = task ? task.status   : 'pending';
  document.getElementById('f-priority').value = task ? task.priority : 'medium';
  document.getElementById('f-due').value      = task ? task.due      : '';
  document.getElementById('f-progress').value = task ? task.progress : 0;
  document.getElementById('modal').classList.add('open');
  setTimeout(() => document.getElementById('f-title').focus(), 200);
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  editing = null;
}

function saveTask() {
  const title = document.getElementById('f-title').value.trim();
  if (!title) { toast('Task title is required!', 'error'); return; }
  const task = {
    id:       editing || Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title,
    desc:     document.getElementById('f-desc').value.trim(),
    status:   document.getElementById('f-status').value,
    priority: document.getElementById('f-priority').value,
    due:      document.getElementById('f-due').value,
    progress: Math.min(100, Math.max(0, parseInt(document.getElementById('f-progress').value) || 0)),
    created:  editing ? tasks.find(t => t.id === editing)?.created || Date.now() : Date.now()
  };
  if (editing) {
    const i = tasks.findIndex(t => t.id === editing);
    if (i > -1) tasks[i] = task;
    toast('Task updated ✅');
  } else {
    tasks.unshift(task);
    toast('Task added ✅');
  }
  save(); closeModal(); renderTasks();
}

function deleteTask(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  if (!card) return;
  if (card.querySelector('.del-confirm')) {
    tasks = tasks.filter(t => t.id !== id);
    save(); renderTasks(); toast('Task deleted', 'error'); return;
  }
  const dc = document.createElement('div');
  dc.className = 'del-confirm';
  dc.innerHTML = `<button class="del-yes" onclick="deleteTask('${id}')">Yes, delete</button><button class="del-no" onclick="this.parentElement.remove()">Cancel</button>`;
  card.querySelector('.task-actions').appendChild(dc);
}

function toggleStatus(id) {
  const t = tasks.find(t => t.id === id); if (!t) return;
  const cycle = { pending: 'inprogress', inprogress: 'completed', completed: 'pending' };
  t.status = cycle[t.status];
  if (t.status === 'completed') t.progress = 100;
  save(); renderTasks(); toast(`Status → ${t.status}`);
}

function toggleCheck(id) {
  const t = tasks.find(t => t.id === id); if (!t) return;
  t.status = t.status === 'completed' ? 'pending' : 'completed';
  if (t.status === 'completed') t.progress = 100;
  save(); renderTasks();
}

function setFilter(f, el) {
  filter = f;
  document.querySelectorAll('.filter-tab, .nav-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderTasks();
}

function renderTasks() {
  const search = (document.getElementById('search-input')?.value || '').toLowerCase();
  const sort   = document.getElementById('sort-select')?.value || 'newest';
  let list = [...tasks];

  if      (filter === 'all') {}
  else if (['pending', 'inprogress', 'completed'].includes(filter)) list = list.filter(t => t.status === filter);
  else if (['high', 'medium', 'low'].includes(filter))             list = list.filter(t => t.priority === filter);

  if (search) list = list.filter(t => t.title.toLowerCase().includes(search) || t.desc.toLowerCase().includes(search));

  const pOrder = { high: 0, medium: 1, low: 2 };
  list.sort((a, b) => {
    if (sort === 'newest')   return b.created - a.created;
    if (sort === 'oldest')   return a.created - b.created;
    if (sort === 'due')      return (a.due || '9999') > (b.due || '9999') ? 1 : -1;
    if (sort === 'priority') return pOrder[a.priority] - pOrder[b.priority];
    if (sort === 'alpha')    return a.title.localeCompare(b.title);
    return 0;
  });

  const grid = document.getElementById('task-grid');
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="es-icon">📭</div><h3>No tasks found</h3><p>Add a new task or change your filter</p></div>`;
  } else {
    grid.innerHTML = list.map(taskCard).join('');
  }
  updateStats();
}

function taskCard(t) {
  const today  = new Date().toISOString().split('T')[0];
  const due    = t.due
    ? (t.due < today && t.status !== 'completed'
        ? `<span class="due-date overdue">🔴 Overdue: ${t.due}</span>`
        : t.due === today
          ? `<span class="due-date soon">🟡 Due today</span>`
          : `<span class="due-date">📅 ${t.due}</span>`)
    : '';
  const pColor = t.status === 'completed' ? 'var(--green)' : t.status === 'inprogress' ? 'var(--orange)' : 'var(--muted)';
  return `<div class="task-card status-${t.status}" data-id="${t.id}">
    <div class="task-left">
      <div class="task-check ${t.status === 'completed' ? 'checked' : ''}" onclick="toggleCheck('${t.id}')"></div>
      <div class="task-body">
        <div class="task-title">${escHtml(t.title)}</div>
        ${t.desc ? `<div class="task-desc">${escHtml(t.desc)}</div>` : ''}
        <div class="task-meta">
          <span class="badge ${t.status}">${statusLabel(t.status)}</span>
          <span class="badge priority-${t.priority}">${t.priority.toUpperCase()}</span>
          ${due}
        </div>
        <div class="task-progress">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:4px"><span>Progress</span><span>${t.progress}%</span></div>
          <div class="task-progress-bar"><div class="task-progress-fill" style="width:${t.progress}%;background:${pColor}"></div></div>
        </div>
      </div>
    </div>
    <div class="task-actions">
      <button class="action-btn status-btn" title="Cycle status" onclick="toggleStatus('${t.id}')">🔄</button>
      <button class="action-btn edit-btn"   title="Edit"         onclick="openModal('${t.id}')">✏️</button>
      <button class="action-btn del-btn"    title="Delete"       onclick="deleteTask('${t.id}')">🗑️</button>
    </div>
  </div>`;
}

function statusLabel(s) {
  return s === 'completed' ? '✅ Completed' : s === 'inprogress' ? '⚙️ In Progress' : '⏳ Pending';
}
function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function updateStats() {
  const total  = tasks.length;
  const done   = tasks.filter(t => t.status === 'completed').length;
  const prog   = tasks.filter(t => t.status === 'inprogress').length;
  const pend   = tasks.filter(t => t.status === 'pending').length;
  const high   = tasks.filter(t => t.priority === 'high').length;
  const medium = tasks.filter(t => t.priority === 'medium').length;
  const low    = tasks.filter(t => t.priority === 'low').length;
  const pct    = total ? Math.round(done / total * 100) : 0;
  const offset = 131.9 - (131.9 * pct / 100);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-total', total);
  set('stat-done',  done);
  set('stat-prog',  prog);
  set('stat-pend',  pend);
  set('done-count', done);
  set('total-count',total);
  set('ring-pct',   pct + '%');
  set('sb-all',       total);
  set('sb-pending',   pend);
  set('sb-inprogress',prog);
  set('sb-completed', done);
  set('sb-high',   high);
  set('sb-medium', medium);
  set('sb-low',    low);

  const ring = document.getElementById('ring-fg');
  if (ring) ring.style.strokeDashoffset = offset;
}


let aiOpen = false;

function toggleAI() {
  aiOpen = !aiOpen;
  document.getElementById('ai-panel').classList.toggle('open', aiOpen);
}

function getTaskContext() {
  const total = tasks.length;
  if (!total) return 'User has no tasks yet.';
  const done    = tasks.filter(t => t.status === 'completed').length;
  const prog    = tasks.filter(t => t.status === 'inprogress').length;
  const pend    = tasks.filter(t => t.status === 'pending').length;
  const pct     = Math.round(done / total * 100);
  const today   = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(t => t.due && t.due < today && t.status !== 'completed').length;
  const highPend= tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
  const taskList= tasks.slice(0, 10).map(t =>
    `- "${t.title}" [${t.status}/${t.priority} priority${t.due ? ', due ' + t.due : ''}]`
  ).join('\n');
  return `Task Management Tracker Summary:\nTotal: ${total} tasks | Completed: ${done} (${pct}%) | In Progress: ${prog} | Pending: ${pend}\nOverdue tasks: ${overdue} | High priority incomplete: ${highPend}\nRecent tasks:\n${taskList}`;
}

async function sendAI() {
  const inp = document.getElementById('ai-input');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  appendMsg(msg, 'user');
  const typingId = appendTyping();
  try {
    const context = getTaskContext();
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a helpful AI assistant for a Task Management Tracker web app built with HTML, CSS, JavaScript (GIET University project). Be concise, friendly, and practical. Use emojis. Here is the user's current task data:\n\n${context}`,
        messages: [{ role: 'user', content: msg }]
      })
    });
    const data = await resp.json();
    removeTyping(typingId);
    appendMsg(data.content?.[0]?.text || "Sorry, I couldn't respond. Try again!", 'bot');
  } catch (e) {
    removeTyping(typingId);
    appendMsg('⚠️ Couldn\'t connect to AI. Check your internet connection!', 'bot');
  }
}

function sendAISug(el) {
  document.getElementById('ai-input').value = el.textContent.replace(/^[^\w]+/, '').trim();
  sendAI();
}

function appendMsg(text, role) {
  const msgs = document.getElementById('ai-messages');
  const div  = document.createElement('div');
  div.className = `ai-msg ${role}`;
  div.innerHTML = `<div class="ai-msg-icon">${role === 'bot' ? '🤖' : '👤'}</div><div class="ai-bubble">${text.replace(/\n/g, '<br>')}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

let typingCounter = 0;
function appendTyping() {
  const id   = 'typing-' + typingCounter++;
  const msgs = document.getElementById('ai-messages');
  const div  = document.createElement('div');
  div.className = 'ai-msg bot';
  div.id = id;
  div.innerHTML = `<div class="ai-msg-icon">🤖</div><div class="ai-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}
function removeTyping(id) { document.getElementById(id)?.remove(); }


function seedTasks() {
  if (tasks.length) return;
  const today   = new Date();
  const fmtDate = d => d.toISOString().split('T')[0];
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  tasks = [
    { id: 't1',  title: 'Project Planning & Documentation',  desc: 'Complete all requirement docs, scope definition, and feature specifications for the Task Tracker.',              status: 'completed', priority: 'high',   due: fmtDate(addDays(today, -10)), progress: 100, created: Date.now() - 1e7 },
    { id: 't2',  title: 'UI/UX Design & Wireframing',        desc: 'Design all wireframes, choose color palette, layout structure for desktop and mobile views.',                   status: 'completed', priority: 'high',   due: fmtDate(addDays(today, -7)),  progress: 100, created: Date.now() - 9e6 },
    { id: 't3',  title: 'HTML Structure & Semantic Markup',   desc: 'Build the complete HTML skeleton with semantic tags, accessibility attributes, and responsive meta tags.',       status: 'completed', priority: 'medium', due: fmtDate(addDays(today, -5)),  progress: 100, created: Date.now() - 8e6 },
    { id: 't4',  title: 'CSS Styling & Responsive Design',    desc: 'Implement all CSS styles, animations, media queries for mobile responsiveness.',                               status: 'completed', priority: 'medium', due: fmtDate(addDays(today, -4)),  progress: 100, created: Date.now() - 7e6 },
    { id: 't5',  title: 'CRUD Operations (Add/Edit/Delete)',  desc: 'Implement full Create, Read, Update, Delete functionality for task management.',                                status: 'completed', priority: 'high',   due: fmtDate(addDays(today, -3)),  progress: 100, created: Date.now() - 6e6 },
    { id: 't6',  title: 'Task Filtering by Status',          desc: 'Add filter buttons for All, Pending, In Progress, Completed with real-time updates.',                           status: 'completed', priority: 'medium', due: fmtDate(addDays(today, -2)),  progress: 100, created: Date.now() - 5e6 },
    { id: 't7',  title: 'Progress Bar & Tracking',           desc: 'Build visual progress indicators with percentage display and color-coded progress bars.',                        status: 'completed', priority: 'medium', due: fmtDate(addDays(today, -1)),  progress: 100, created: Date.now() - 4e6 },
    { id: 't8',  title: 'Local Storage Integration',         desc: 'Store all task data in browser localStorage so data persists across sessions without backend.',                 status: 'completed', priority: 'high',   due: fmtDate(today),               progress: 100, created: Date.now() - 3e6 },
    { id: 't9',  title: 'AI Assistant Integration',          desc: 'Integrate Claude AI API to provide intelligent task suggestions, summaries, and productivity tips.',            status: 'inprogress',priority: 'high',   due: fmtDate(addDays(today,  3)),  progress: 60,  created: Date.now() - 2e6 },
    { id: 't10', title: 'Testing & Bug Fixing',              desc: 'Perform comprehensive testing across browsers and devices. Fix all identified bugs.',                            status: 'pending',   priority: 'medium', due: fmtDate(addDays(today,  7)),  progress: 0,   created: Date.now() - 1e6 },
    { id: 't11', title: 'Deployment & Hosting',              desc: 'Deploy the application and make it accessible via a public URL.',                                               status: 'pending',   priority: 'low',    due: fmtDate(addDays(today, 14)),  progress: 0,   created: Date.now() - 5e5 },
  ];
  save();
}
