// The launch splash's styles, inlined in <head> by the root layout. Everything the splash needs to draw is here,
// so it paints the moment the HTML arrives, without waiting for the main stylesheet. That's also why the colours
// are written out rather than taken from the theme's variables (which live in that stylesheet). Keep them in sync
// with globals.css: ink #0f1220 (background), navy #1b2036 (surface), dusk #394166 (border), cream #f5f3ed (text),
// sunrise #f28c4b (brand).
//
// The splash is hidden unless the head script sets data-launch-splash on <html> (see splashConfig.ts). If the app's
// JavaScript never runs, the fallback fade-out after 6s still uncovers the page.
export const SPLASH_CSS = `
html{background-color:#0f1220;color-scheme:dark}
.launch-splash{display:none}
:root[data-launch-splash] .launch-splash{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:#0f1220;animation:splash-out 400ms ease-in 6s forwards}
:root[data-launch-splash="leaving"] .launch-splash{animation:splash-leave 400ms ease-in forwards}
:root[data-launch-splash]:not([data-launch-splash="leaving"]) body{overflow:hidden}
.launch-splash-glow{position:absolute;inset:0;background-image:radial-gradient(45% 35% at 50% 45%,rgba(242,140,75,.22),transparent 70%);animation:splash-fade 700ms ease-out both}
.launch-splash-body{position:relative;display:flex;flex-direction:column;align-items:center}
.launch-splash-mark{box-sizing:border-box;display:flex;width:5rem;height:5rem;align-items:center;justify-content:center;border-radius:1rem;border:1px solid #394166;background:#1b2036;color:#f5f3ed;box-shadow:0 20px 24px -4px rgba(16,24,40,.08),0 8px 8px -4px rgba(16,24,40,.03);animation:splash-pop 650ms cubic-bezier(.34,1.56,.64,1) both}
.launch-splash-mark svg{width:2.5rem;height:2.5rem}
.launch-splash-ring{box-sizing:border-box;position:absolute;top:0;left:50%;width:5rem;height:5rem;margin-left:-2.5rem;border-radius:1.25rem;border:2px solid #f28c4b;opacity:0;animation:splash-ring 1100ms ease-out 350ms both}
.launch-splash-name{margin-top:1.25rem;font-family:var(--font-geist-sans,ui-sans-serif),ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;font-size:1.5rem;line-height:2rem;font-weight:600;letter-spacing:-.025em;color:#f5f3ed;animation:splash-rise 500ms ease-out 300ms both}
@keyframes splash-pop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
@keyframes splash-ring{from{opacity:.7;transform:scale(1)}to{opacity:0;transform:scale(1.9)}}
@keyframes splash-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes splash-fade{from{opacity:0}to{opacity:1}}
@keyframes splash-out{to{opacity:0;visibility:hidden}}
@keyframes splash-leave{from{opacity:1}to{opacity:0;transform:scale(1.03);visibility:hidden}}
@media (prefers-reduced-motion:reduce){.launch-splash-mark,.launch-splash-name,.launch-splash-glow{animation:splash-fade 300ms ease-out both}.launch-splash-ring{display:none}}
`.trim();
