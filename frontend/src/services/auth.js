const STORAGE_KEY = "kirana_auth";

export const ROLES = { CUSTOMER: "customer", OWNER: "owner" };

const MOCK_USERS = [
  { id: "C001", name: "Rajesh Kumar", role: ROLES.CUSTOMER, phone: "9876543210" },
  { id: "C002", name: "Priya Sharma", role: ROLES.CUSTOMER, phone: "9876543211" },
  { id: "OWNER-1", name: "Store Owner", role: ROLES.OWNER, phone: "9999999999" },
];

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function login(identifier, password, role) {
  await new Promise((r) => setTimeout(r, 400));

  if (!identifier || !password) {
    return { success: false, message: "Please enter both identifier and password." };
  }

  if (password !== "password") {
    return { success: false, message: "Invalid password. Try: password" };
  }

  let user = MOCK_USERS.find((u) => u.role === role && (u.phone === identifier || u.name.toLowerCase() === identifier.toLowerCase() || u.id.toLowerCase() === identifier.toLowerCase()));

  if (!user) {
    if (role === ROLES.CUSTOMER) {
      user = { id: `C-${Date.now()}`, name: identifier, role: ROLES.CUSTOMER, phone: identifier };
    } else {
      user = { id: "OWNER-1", name: "Store Owner", role: ROLES.OWNER, phone: identifier };
    }
  }

  const authUser = { id: user.id, name: user.name, role: user.role, phone: user.phone };
  setStoredAuth(authUser);
  return { success: true, user: authUser };
}

export async function logout() {
  await new Promise((r) => setTimeout(r, 200));
  clearStoredAuth();
  return { success: true };
}

export function isAuthenticated() {
  return !!getStoredAuth();
}

export function getCurrentUser() {
  return getStoredAuth();
}
