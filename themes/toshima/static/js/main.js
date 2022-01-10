const main = () => {
  const themeButtons = document.querySelectorAll("[data-js='theme']")

  // mode指定
  const setTheme = (theme) => {
    themeButtons.forEach(button => {
      button.setAttribute("aria-pressed", button.value === theme ? "true" : "false");
    })
    document.body.className = "";
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }

  // mode判定
  const theme = localStorage.getItem("theme");
  if (theme === "dark" || (theme === null && matchMedia('(prefers-color-scheme: dark)').matches)) {
    setTheme("dark");
  } else {
    setTheme("light");
  }

  // mode切り替え
  themeButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const value = e.currentTarget.value;
      setTheme(value);
    })
  })
}

window.onload = main;
