// ============================================================
//  STUDENTS MODULE
// ============================================================

const Students = (() => {

  async function getAll(search = '') {
    let query = supabase
      .from('students')
      .select(`
        *,
        payments (*)
      `)
      .order('last_name', { ascending: true });

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,grade.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function getById(id) {
    const { data, error } = await supabase
      .from('students')
      .select(`*, payments (*)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async function create(studentData, initialPayment) {
    // Insert student
    const { data: student, error: sErr } = await supabase
      .from('students')
      .insert([{
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        dob: studentData.dob,
        grade: studentData.grade,
        phone: studentData.phone,
        email: studentData.email,
        parent_name: studentData.parentName,
        parent_phone: studentData.parentPhone,
        parent_relation: studentData.parentRelation,
        emergency_name: studentData.emergencyName,
        emergency_phone: studentData.emergencyPhone,
        medical_notes: studentData.medicalNotes,
        status: 'Active',
        enroll_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (sErr) throw sErr;

    // Insert initial payment
    if (initialPayment && initialPayment.amount > 0) {
      const { error: pErr } = await supabase
        .from('payments')
        .insert([{
          student_id: student.id,
          type: initialPayment.type,
          amount: parseFloat(initialPayment.amount),
          date: new Date().toISOString().split('T')[0],
          method: initialPayment.method,
          status: 'Paid',
          note: 'Enrollment payment'
        }]);
      if (pErr) throw pErr;
    }

    return student;
  }

  async function update(id, updates) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function remove(id) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  return { getAll, getById, create, update, remove };
})();
