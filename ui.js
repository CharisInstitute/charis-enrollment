// ============================================================
//  UI MODULE — All HTML rendering
// ============================================================

const UI = (() => {

  function toast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
  }

  function setLoading(selector, loading) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (loading) el.setAttribute('disabled', true), el.dataset.orig = el.textContent, el.textContent = 'Saving...';
    else el.removeAttribute('disabled'), el.textContent = el.dataset.orig || 'Save';
  }

  function initials(first, last) {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
  }

  function statusTag(status) {
    const map = { Active: 'success', Inactive: 'warn', Paid: 'success', Pending: 'warn', Waived: 'info' };
    return `<span class="tag tag-${map[status] || 'info'}">${status}</span>`;
  }

  // ---- LOGIN ----
  function loginPage() {
    return `
    <div class="login-wrap">
      <div class="login-box">
        <div class="login-logo">
          <div class="logo-mark">C</div>
          <h1>Charis Christian Institute</h1>
          <p>Student Enrollment System</p>
        </div>
        <div id="login-err" class="alert alert-danger hidden"></div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="login-email" placeholder="staff@charischristian.edu" autocomplete="username" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password" />
        </div>
        <button class="btn btn-primary btn-block" id="login-btn">Sign In</button>
        <p class="login-note">Access restricted to authorized Charis staff only.</p>
      </div>
    </div>`;
  }

  // ---- SHELL ----
  function shell(view, profile) {
    const tabs = [
      { id: 'students', label: 'Students', icon: '👤' },
      { id: 'payments', label: 'Payments', icon: '💳' },
      ...(profile?.role === 'Administrator' ? [{ id: 'staff', label: 'Staff', icon: '🔑' }] : [])
    ];
    return `
    <div class="app-shell">
      <header class="topbar">
        <div class="topbar-left">
          <div class="logo-mark sm">C</div>
          <div>
            <div class="school-name">Charis Christian Institute</div>
            <div class="school-sub">Enrollment System</div>
          </div>
        </div>
        <div class="topbar-right">
          <span class="staff-badge">${profile?.full_name || 'Staff'} &middot; <em>${profile?.role || ''}</em></span>
          <button class="btn btn-sm" id="logout-btn">Sign out</button>
        </div>
      </header>
      <nav class="sidebar">
        ${tabs.map(t => `<button class="nav-item ${view === t.id ? 'active' : ''}" data-view="${t.id}">${t.icon} ${t.label}</button>`).join('')}
      </nav>
      <main class="main-content" id="main-content">
        <div class="splash"><div class="spinner"></div></div>
      </main>
    </div>`;
  }

  // ---- STUDENTS VIEW ----
  function studentsView(students, search) {
    const total = students.length;
    const active = students.filter(s => s.status === 'Active').length;
    const collected = students.flatMap(s => s.payments || []).filter(p => p.status === 'Paid').reduce((a, p) => a + Number(p.amount), 0);
    const pending = students.flatMap(s => s.payments || []).filter(p => p.status === 'Pending').reduce((a, p) => a + Number(p.amount), 0);

    return `
    <div class="view-header">
      <h2>Students</h2>
      <button class="btn btn-primary" id="enroll-btn">+ Enroll Student</button>
    </div>
    <div class="metrics-grid">
      <div class="metric"><div class="metric-label">Total Students</div><div class="metric-val">${total}</div></div>
      <div class="metric"><div class="metric-label">Active</div><div class="metric-val green">${active}</div></div>
      <div class="metric"><div class="metric-label">Total Collected</div><div class="metric-val">$${collected.toLocaleString()}</div></div>
      <div class="metric"><div class="metric-label">Pending</div><div class="metric-val amber">$${pending.toLocaleString()}</div></div>
    </div>
    <div class="toolbar">
      <input class="search-input" id="search-input" placeholder="Search by name or grade..." value="${search || ''}" />
    </div>
    <div class="card p-0">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Student</th><th>Grade</th><th>Enrolled</th>
            <th>Paid</th><th>Pending</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
          ${students.length === 0
            ? `<tr><td colspan="7" class="empty-row">No students found.</td></tr>`
            : students.map(s => {
              const paid = (s.payments || []).filter(p => p.status === 'Paid').reduce((a, p) => a + Number(p.amount), 0);
              const pend = (s.payments || []).filter(p => p.status === 'Pending').reduce((a, p) => a + Number(p.amount), 0);
              return `<tr>
                <td>
                  <div class="row-flex">
                    <div class="avatar">${initials(s.first_name, s.last_name)}</div>
                    <div>
                      <div class="name">${s.first_name} ${s.last_name}</div>
                      <div class="sub">${s.phone || s.email || ''}</div>
                    </div>
                  </div>
                </td>
                <td>${s.grade}</td>
                <td>${s.enroll_date || ''}</td>
                <td class="green">$${paid.toLocaleString()}</td>
                <td class="${pend > 0 ? 'amber' : ''}">$${pend.toLocaleString()}</td>
                <td>${statusTag(s.status)}</td>
                <td class="actions">
                  <button class="btn btn-sm view-btn" data-id="${s.id}">View</button>
                  <button class="btn btn-sm pay-btn" data-id="${s.id}">+ Payment</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  // ---- PAYMENTS VIEW ----
  function paymentsView(summary) {
    const { totalCollected, tuitionCollected, testFeesCollected, pendingTotal, allPayments } = summary;
    return `
    <div class="view-header"><h2>Payment Ledger</h2></div>
    <div class="metrics-grid">
      <div class="metric"><div class="metric-label">Total Collected</div><div class="metric-val">$${totalCollected.toLocaleString()}</div></div>
      <div class="metric"><div class="metric-label">Tuition</div><div class="metric-val">$${tuitionCollected.toLocaleString()}</div></div>
      <div class="metric"><div class="metric-label">Test Fees</div><div class="metric-val">$${testFeesCollected.toLocaleString()}</div></div>
      <div class="metric"><div class="metric-label">Pending</div><div class="metric-val amber">$${pendingTotal.toLocaleString()}</div></div>
    </div>
    <div class="card p-0">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Student</th><th>Grade</th><th>Type</th><th>Amount</th><th>Method</th><th>Note</th><th>Status</th></tr></thead>
          <tbody>
          ${allPayments.length === 0
            ? `<tr><td colspan="8" class="empty-row">No payments recorded.</td></tr>`
            : allPayments.map(p => `<tr>
              <td>${p.date}</td>
              <td class="name">${p.students?.first_name || ''} ${p.students?.last_name || ''}</td>
              <td>${p.students?.grade || ''}</td>
              <td>${p.type}</td>
              <td class="bold">$${Number(p.amount).toLocaleString()}</td>
              <td>${p.method}</td>
              <td class="sub">${p.note || '—'}</td>
              <td>${statusTag(p.status)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  // ---- STAFF VIEW ----
  function staffView(profiles) {
    return `
    <div class="view-header">
      <h2>Staff Access</h2>
      <button class="btn btn-primary" id="add-staff-btn">+ Add Staff</button>
    </div>
    <div class="card p-0">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Access Level</th></tr></thead>
          <tbody>
          ${(profiles || []).map(p => `<tr>
            <td><div class="row-flex"><div class="avatar">${initials(p.full_name?.split(' ')[0], p.full_name?.split(' ')[1])}</div><span class="name">${p.full_name}</span></div></td>
            <td class="sub">${p.email || ''}</td>
            <td><span class="tag tag-info">${p.role}</span></td>
            <td class="sub">${p.role === 'Administrator' ? 'Full access' : p.role === 'Registrar' ? 'Enrollment & student records' : 'Payments & financial reports'}</td>
          </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <p class="hint">To add staff: create their account in Supabase Auth → then insert a row in <code>staff_profiles</code> with their user ID, name, and role.</p>`;
  }

  // ---- MODALS ----
  function enrollModal() {
    return `
    <div class="modal-backdrop" id="modal-backdrop">
    <div class="modal">
      <div class="modal-header"><h3>Enroll New Student</h3><button class="close-btn" id="modal-close">&times;</button></div>
      <div class="modal-body">
        <div class="section-title">Student Information</div>
        <div class="two-col">
          <div class="form-group"><label>First Name *</label><input id="ef-fname" /></div>
          <div class="form-group"><label>Last Name *</label><input id="ef-lname" /></div>
        </div>
        <div class="two-col">
          <div class="form-group"><label>Date of Birth *</label><input id="ef-dob" type="date" /></div>
          <div class="form-group"><label>Grade *</label>
            <select id="ef-grade">${GRADES.map(g => `<option>${g}</option>`).join('')}</select>
          </div>
        </div>
        <div class="two-col">
          <div class="form-group"><label>Phone</label><input id="ef-phone" placeholder="304-555-0000" /></div>
          <div class="form-group"><label>Email</label><input id="ef-email" type="email" placeholder="parent@email.com" /></div>
        </div>
        <div class="section-title">Parent / Guardian</div>
        <div class="two-col">
          <div class="form-group"><label>Full Name *</label><input id="ef-pname" /></div>
          <div class="form-group"><label>Relationship</label>
            <select id="ef-prelation"><option>Mother</option><option>Father</option><option>Guardian</option><option>Other</option></select>
          </div>
        </div>
        <div class="form-group"><label>Parent Phone</label><input id="ef-pphone" placeholder="304-555-0000" /></div>
        <div class="section-title">Emergency Contact</div>
        <div class="two-col">
          <div class="form-group"><label>Name *</label><input id="ef-ename" /></div>
          <div class="form-group"><label>Phone *</label><input id="ef-ephone" placeholder="304-555-0000" /></div>
        </div>
        <div class="section-title">Medical / Health Notes</div>
        <div class="form-group">
          <textarea id="ef-medical" rows="3" placeholder="Allergies, medications, conditions, special needs..."></textarea>
        </div>
        <div class="section-title">Initial Payment (Required)</div>
        <div class="three-col">
          <div class="form-group"><label>Type</label>
            <select id="ef-ptype">${PAYMENT_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Amount ($) *</label><input id="ef-pamount" type="number" min="0" step="0.01" placeholder="0.00" /></div>
          <div class="form-group"><label>Method</label>
            <select id="ef-pmethod">${PAYMENT_METHODS.map(m => `<option>${m}</option>`).join('')}</select>
          </div>
        </div>
        <div id="enroll-err" class="alert alert-danger hidden"></div>
      </div>
      <div class="modal-footer">
        <button class="btn" id="enroll-cancel">Cancel</button>
        <button class="btn btn-primary" id="enroll-submit">Enroll Student</button>
      </div>
    </div></div>`;
  }

  function paymentModal(studentName) {
    return `
    <div class="modal-backdrop" id="modal-backdrop">
    <div class="modal modal-sm">
      <div class="modal-header"><h3>Add Payment — ${studentName}</h3><button class="close-btn" id="modal-close">&times;</button></div>
      <div class="modal-body">
        <div class="two-col">
          <div class="form-group"><label>Type *</label>
            <select id="pf-type">${PAYMENT_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Amount ($) *</label><input id="pf-amount" type="number" min="0" step="0.01" placeholder="0.00" /></div>
        </div>
        <div class="two-col">
          <div class="form-group"><label>Date *</label><input id="pf-date" type="date" value="${new Date().toISOString().split('T')[0]}" /></div>
          <div class="form-group"><label>Method</label>
            <select id="pf-method">${PAYMENT_METHODS.map(m => `<option>${m}</option>`).join('')}</select>
          </div>
        </div>
        <div class="form-group"><label>Status</label>
          <select id="pf-status">${PAYMENT_STATUSES.map(s => `<option>${s}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Note</label><input id="pf-note" placeholder="Optional note..." /></div>
        <div id="pay-err" class="alert alert-danger hidden"></div>
      </div>
      <div class="modal-footer">
        <button class="btn" id="pay-cancel">Cancel</button>
        <button class="btn btn-primary" id="pay-submit">Save Payment</button>
      </div>
    </div></div>`;
  }

  function studentDetailModal(s, payments) {
    const paid = payments.filter(p => p.status === 'Paid').reduce((a, p) => a + Number(p.amount), 0);
    const pend = payments.filter(p => p.status === 'Pending').reduce((a, p) => a + Number(p.amount), 0);
    return `
    <div class="modal-backdrop" id="modal-backdrop">
    <div class="modal modal-lg">
      <div class="modal-header">
        <div class="row-flex">
          <div class="avatar lg">${initials(s.first_name, s.last_name)}</div>
          <div>
            <h3>${s.first_name} ${s.last_name}</h3>
            <p class="sub">${s.grade} &middot; Enrolled ${s.enroll_date} &middot; ${statusTag(s.status)}</p>
          </div>
        </div>
        <button class="close-btn" id="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="metrics-grid four">
          <div class="metric"><div class="metric-label">Total Paid</div><div class="metric-val green">$${paid.toLocaleString()}</div></div>
          <div class="metric"><div class="metric-label">Pending</div><div class="metric-val amber">$${pend.toLocaleString()}</div></div>
          <div class="metric"><div class="metric-label">Transactions</div><div class="metric-val">${payments.length}</div></div>
          <div class="metric"><div class="metric-label">DOB</div><div class="metric-val sm">${s.dob || '—'}</div></div>
        </div>
        <div class="detail-grid">
          <div class="detail-card"><div class="section-title">Contact</div>
            <p>${s.phone || '—'}</p><p class="sub">${s.email || '—'}</p>
          </div>
          <div class="detail-card"><div class="section-title">Parent / Guardian</div>
            <p class="bold">${s.parent_name || '—'} <span class="sub">(${s.parent_relation || ''})</span></p>
            <p class="sub">${s.parent_phone || '—'}</p>
          </div>
          <div class="detail-card"><div class="section-title">Emergency Contact</div>
            <p class="bold">${s.emergency_name || '—'}</p>
            <p class="sub">${s.emergency_phone || '—'}</p>
          </div>
          <div class="detail-card"><div class="section-title">Medical Notes</div>
            <p class="sub">${s.medical_notes || 'None on file'}</p>
          </div>
        </div>
        <div class="section-header">
          <div class="section-title" style="margin:0;">Payment History</div>
          <button class="btn btn-sm btn-primary pay-btn" data-id="${s.id}">+ Add Payment</button>
        </div>
        ${payments.length === 0
          ? `<p class="sub" style="padding:1rem 0;">No payments recorded.</p>`
          : `<div class="card p-0"><table><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Method</th><th>Note</th><th>Status</th></tr></thead><tbody>
          ${payments.map(p => `<tr>
            <td>${p.date}</td>
            <td>${p.type}</td>
            <td class="bold">$${Number(p.amount).toLocaleString()}</td>
            <td>${p.method}</td>
            <td class="sub">${p.note || '—'}</td>
            <td>${statusTag(p.status)}</td>
          </tr>`).join('')}
          </tbody></table></div>`}
      </div>
      <div class="modal-footer">
        <button class="btn" id="modal-close-2">Close</button>
      </div>
    </div></div>`;
  }

  return { toast, setLoading, loginPage, shell, studentsView, paymentsView, staffView, enrollModal, paymentModal, studentDetailModal, statusTag };
})();
