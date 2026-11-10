// Remembers the desktop sidebar's size across visits. Read on the server (app layout), so the page arrives
// already collapsed instead of flicking from wide to narrow; written in the browser when ☰ is pressed.
// Lives outside AppNavProvider ("use client"): a server component importing a plain value from a client
// module gets a reference stub, not the string.
export const SIDEBAR_COOKIE = "godswheel_sidebar";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
