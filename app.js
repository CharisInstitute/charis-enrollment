// ============================================================
//  APP CONTROLLER — Main orchestration
// ============================================================

const App = (() => {
  let currentView = 'students';
  let searchQuery = '';
  let selectedStudentId = null;
  let modalMode = null; // 'enroll' | 'payment' | 'student-detail'

  async function render() {
    const app = document.getElementById('app');
    if (!Auth.isLoggedIn()) {
      app.innerHTML = UI.loginPage();
      bindLogin();
      return;
    }
    app.innerHTML = UI.shell(currentView, Auth.getProfile());
    bindNav();
    await renderView();
  }

  async function renderView() {
    const main = document.getElementById('main-content');
    try {
      if (currentView === 'students') {
        const students = await Students.getAll(searchQuery);
        main.innerHTML = UI.studentsView(students, searchQuery);
        bindStudentsView();
      } else if (currentView === 'payments') {
        const summary = await Payments.getSummary();
        main.innerHTML = UI.paymentsView(summary);
      } else if (currentView === 'staff') {
        const { data } = await supabase.from('staff_profiles').select('*').order('full_name');
        main.innerHTML = UI.staffView(data || []);
        document.getElementById('add-staff-btn')?.addEventListener('click', () => {
          UI.toast('To add staff: create account in Supabase Auth, then add a row to staff_profiles table.', 'info');
        });
      }
    } catch (err) {
      main.innerHTML = `<div class="alert alert-danger">Error loading data: ${err.message}</div>`;
    }
  }

  function bindLogin() {
    const btn = document.getElementById('login-btn');
    const errEl = document.getElementById('login-err');

    const doLogin = async () => {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      errEl.classList.add('hidden');
      btn.disabled = true; btn.textContent = 'Signing in...';
      try {
        await Auth.login(email, password);
      } catch (err) {
        errEl.textContent = 'Invalid email or password. Please try again.';
        errEl.classList.remove('hidden');
        btn.disabled = false; btn.textContent = 'Sign In';
      }
    };

    btn.addEventListener('click', doLogin);
    document.getElementById('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  }

  function bindNav() {
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await Auth.logout();
      render();
    });
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        currentView = btn.dataset.view;
        render();
      });
    });
  }

  function bindStudentsView() {
    const si = document.getElementById('search-input');
    if (si) {
      let timeout;
      si.addEventListener('input', e => {
        clearTimeout(timeout);
        timeout = setTimeout(() => { searchQuery = e.target.value; renderView(); }, 350);
      });
    }

    document.getElementById('enroll-btn')?.addEventListener('click', () => {
      openEnrollModal();
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => openStudentDetail(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll('.pay-btn').forEach(btn => {
      btn.addEventListener('click', () => openPaymentModal(parseInt(btn.dataset.id)));
    });
  }

  // ---- ENROLL MODAL ----
  function openEnrollModal() {
    const main = document.getElementById('main-content');
    main.insertAdjacentHTML('afterend', UI.enrollModal());
    document.getElementById('modal-close').onclick =
    document.getElementById('enroll-cancel').onclick = closeModal;
    document.getElementById('modal-backdrop').addEventListener('click', e => { if (e.target.id === 'modal-backdrop') closeModal(); });
    document.getElementById('enroll-submit').addEventListener('click', submitEnroll);
  }

  async function submitEnroll() {
    const errEl = document.getElementById('enroll-err');
    errEl.classList.add('hidden');

    const fname = document.getElementById('ef-fname').value.trim();
    const lname = document.getElementById('ef-lname').value.trim();
    const dob = document.getElementById('ef-dob').value;
    const pname = document.getElementById('ef-pname').value.trim();
    const ename = document.getElementById('ef-ename').value.trim();
    const ephone = document.getElementById('ef-ephone').value.trim();
    const amount = parseFloat(document.getElementById('ef-pamount').value);

    if (!fname || !lname || !dob || !pname || !ename || !ephone || isNaN(amount) || amount <= 0) {
      errEl.textContent = 'Please complete all required fields (*) and enter a valid payment amount.';
      errEl.classList.remove('hidden');
      return;
    }

    UI.setLoading('#enroll-submit', true);
    try {
      await Students.create({
        firstName: fname, lastName: lname, dob,
        grade: document.getElementById('ef-grade').value,
        phone: document.getElementById('ef-phone').value.trim(),
        email: document.getElementById('ef-email').value.trim(),
        parentName: pname,
        parentPhone: document.getElementById('ef-pphone').value.trim(),
        parentRelation: document.getElementById('ef-prelation').value,
        emergencyName: ename, emergencyPhone: ephone,
        medicalNotes: document.getElementById('ef-medical').value.trim()
      }, {
        type: document.getElementById('ef-ptype').value,
        amount,
        method: document.getElementById('ef-pmethod').value
      });
      closeModal();
      UI.toast(`${fname} ${lname} enrolled successfully!`);
      await renderView();
    } catch (err) {
      errEl.textContent = 'Error saving: ' + err.message;
      errEl.classList.remove('hidden');
      UI.setLoading('#enroll-submit', false);
    }
  }

  // ---- PAYMENT MODAL ----
  async function openPaymentModal(studentId) {
    selectedStudentId = studentId;
    closeModal();
    const student = await Students.getById(studentId);
    const name = `${student.first_name} ${student.last_name}`;
    const main = document.getElementById('main-content');
    main.insertAdjacentHTML('afterend', UI.paymentModal(name));
    document.getElementById('modal-close').onclick =
    document.getElementById('pay-cancel').onclick = closeModal;
    document.getElementById('modal-backdrop').addEventListener('click', e => { if (e.target.id === 'modal-backdrop') closeModal(); });
    document.getElementById('pay-submit').addEventListener('click', submitPayment);
  }

  async function submitPayment() {
    const errEl = document.getElementById('pay-err');
    errEl.classList.add('hidden');
    const amount = parseFloat(document.getElementById('pf-amount').value);
    const date = document.getElementById('pf-date').value;
    if (isNaN(amount) || amount <= 0 || !date) {
      errEl.textContent = 'Please enter a valid amount and date.';
      errEl.classList.remove('hidden');
      return;
    }
    UI.setLoading('#pay-submit', true);
    try {
      await Payments.create({
        studentId: selectedStudentId,
        type: document.getElementById('pf-type').value,
        amount, date,
        method: document.getElementById('pf-method').value,
        status: document.getElementById('pf-status').value,
        note: document.getElementById('pf-note').value.trim()
      });
      closeModal();
      UI.toast('Payment saved successfully!');
      await renderView();
    } catch (err) {
      errEl.textContent = 'Error saving: ' + err.message;
      errEl.classList.remove('hidden');
      UI.setLoading('#pay-submit', false);
    }
  }

  // ---- STUDENT DETAIL MODAL ----
  async function openStudentDetail(studentId) {
    selectedStudentId = studentId;
    const student = await Students.getById(studentId);
    const payments = await Payments.getByStudent(studentId);
    const main = document.getElementById('main-content');
    main.insertAdjacentHTML('afterend', UI.studentDetailModal(student, payments));
    document.getElementById('modal-close').onclick =
    document.getElementById('modal-close-2').onclick = closeModal;
    document.getElementById('modal-backdrop').addEventListener('click', e => { if (e.target.id === 'modal-backdrop') closeModal(); });
    document.querySelectorAll('.pay-btn').forEach(btn => {
      btn.addEventListener('click', () => openPaymentModal(parseInt(btn.dataset.id)));
    });
  }

  function closeModal() {
    document.getElementById('modal-backdrop')?.remove();
  }

  // ---- INIT ----
  async function init() {
    await Auth.init();
    render();
  }

  return { init, render };
})();

document.addEventListener('DOMContentLoaded', App.init);
