export function themeInitScriptContent(): string {
  return `
(function () {
  try {
    var k = "sahib-chat-theme";
    var v = localStorage.getItem(k);
    var d = document.documentElement;
    if (v === "light") { d.classList.remove("dark"); d.classList.add("light"); return; }
    if (v === "dark") { d.classList.add("dark"); d.classList.remove("light"); return; }
    if (v === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        d.classList.add("dark"); d.classList.remove("light");
      } else { d.classList.remove("dark"); d.classList.add("light"); }
      return;
    }
    d.classList.add("dark"); d.classList.remove("light");
  } catch (e) {}
})();
`.trim();
}
