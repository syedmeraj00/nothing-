// Global error handler for connection issues
window.addEventListener('error', (event) => {
  if (event.message.includes('Could not establish connection')) {
    console.warn('Extension connection error suppressed:', event.message);
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Could not establish connection')) {
    console.warn('Extension promise rejection suppressed:', event.reason.message);
    event.preventDefault();
  }
});