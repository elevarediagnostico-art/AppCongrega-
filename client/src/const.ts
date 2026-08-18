export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Emergent-managed Google Auth login. Call this from an event handler
// (e.g. `onClick={() => startLogin()}`), never during render.
//
// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export const startLogin = () => {
  const redirectUrl = window.location.origin + "/";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};
