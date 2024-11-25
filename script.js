document.addEventListener('DOMContentLoaded', function () {
  const toggleThemeButton = document.getElementById('toggleTheme');
  const themeImage = document.getElementById('tti');
  
  // Define default theme and possible theme options
  const DEFAULT_THEME = 'light';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';
  
  // Get stored theme preference from localStorage
  let storedTheme = localStorage.getItem('theme');

  // Function to detect system theme preference
  function detectSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_THEME : LIGHT_THEME;
  }

  // Determine initial theme based on stored preference, system preference, or default
  let initialTheme = storedTheme || detectSystemTheme() || DEFAULT_THEME;
  
  // Apply the initial theme
  applyTheme(initialTheme);

  // Event listener for theme toggle button
  toggleThemeButton.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
    applyTheme(newTheme);
  });

  // Function to apply the theme and update relevant attributes
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
    localStorage.setItem('theme', theme);
  }

  // Update theme icon and aria-label
  function updateThemeIcon(theme) {
    if (theme === DARK_THEME) {
      themeImage.src = 'images/Sun.png';
      themeImage.alt = 'Change to light theme';
      themeImage.setAttribute('aria-label', 'Change to light theme');
    } else {
      themeImage.src = 'images/Moon.png';
      themeImage.alt = 'Change to dark theme';
      themeImage.setAttribute('aria-label', 'Change to dark theme');
    }
  }
});
