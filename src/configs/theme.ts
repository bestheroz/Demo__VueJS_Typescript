export default {
  // global theme for the app
  globalTheme: "light", // light | dark

  // side menu theme, use global theme or custom
  menuTheme: "global", // global | light | dark

  // toolbar theme, use global theme or custom
  toolbarTheme: "global", // global | light | dark

  // show toolbar detached from top
  isToolbarDetached: false,

  // wrap pages content with a max-width
  isContentBoxed: false,

  // application is right to left
  isRTL: false,

  // dark theme colors
  dark: {
    background: "#05090c",
    surface: "#111b27",
    primary: "#2196F3",
    secondary: "#829099",
    accent: "#448AFF",
    error: "#C62828",
    info: "#00838F",
    success: "#2E7D32",
    warning: "#EF6C00",
  },

  // light theme colors
  light: {
    background: "#ffffff",
    surface: "#f2f5f8",
    primary: "#2196F3",
    secondary: "#a0b9c8",
    accent: "#82B1FF",
    error: "#EF5350",
    info: "#26C6DA",
    success: "#66BB6A",
    warning: "#FF5722",
  },
};
