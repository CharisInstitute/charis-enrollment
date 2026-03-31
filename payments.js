// ============================================================
//  PAYMENTS MODULE
// ============================================================

const Payments = (() => {

  async function getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        students (first_name, last_name, grade)
      `)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getByStudent(studentId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function create(paymentData) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        student_id: paymentData.studentId,
        type: paymentData.type,
        amount: parseFloat(paymentData.amount),
        date: paymentData.date,
        method: paymentData.method,
        status: paymentData.status,
        note: paymentData.note || ''
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateStatus(id, status) {
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function remove(id) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async function getSummary() {
    const all = await getAll();
    const paid = all.filter(p => p.status === 'Paid');
    const pending = all.filter(p => p.status === 'Pending');
    return {
      totalCollected: paid.reduce((s, p) => s + Number(p.amount), 0),
      tuitionCollected: paid.filter(p => p.type === 'Tuition').reduce((s, p) => s + Number(p.amount), 0),
      testFeesCollected: paid.filter(p => p.type === 'Test Fee').reduce((s, p) => s + Number(p.amount), 0),
      pendingTotal: pending.reduce((s, p) => s + Number(p.amount), 0),
      allPayments: all
    };
  }

  return { getAll, getByStudent, create, updateStatus, remove, getSummary };
})();
