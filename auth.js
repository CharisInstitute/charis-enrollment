// ============================================================
//  AUTH MODULE
// ============================================================

const Auth = (() => {
  let currentUser = null;
  let currentProfile = null;

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      currentUser = session.user;
      await loadProfile();
    }
    supabase.auth.onAuthStateChange(async (_event, session) => {
      currentUser = session?.user ?? null;
      if (currentUser) await loadProfile();
      else currentProfile = null;
      App.render();
    });
  }

  async function loadProfile() {
    const { data } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    currentProfile = data;
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  function getUser() { return currentUser; }
  function getProfile() { return currentProfile; }
  function isAdmin() { return currentProfile?.role === 'Administrator'; }
  function isLoggedIn() { return !!currentUser; }

  return { init, login, logout, getUser, getProfile, isAdmin, isLoggedIn };
})();
