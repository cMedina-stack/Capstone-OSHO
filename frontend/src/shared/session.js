export function readSession() {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (
      !["admin", "employee"].includes(user?.role) ||
      payload.exp * 1000 <= Date.now() ||
      payload.role !== user.role
    )
      return null;
    return { token, user, expiresAt: payload.exp * 1000 };
  } catch {
    return null;
  }
}
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("session-expired"));
}
