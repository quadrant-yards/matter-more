// For easy debugging only
let dbgClonedData = {}; 

// Update page title with article count
function updateTitle(count) {
  // Remove existing count if present
  const baseTitle = document.title.replace(/\s*\(\d+\)$/, '');

  document.title = `${baseTitle} (${count})`;
}

// Intercept fetch requests to capture queue feed API responses
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const response = await originalFetch.apply(this, args);

  const url = typeof args[0] === 'string' ? args[0] : args[0].url;

  if (url && url.includes('/api/library_items/queue_feed')) {
    const clonedResponse = response.clone();

    try {
      const data = await clonedResponse.json();
      dbgClonedData = data;

      // Only update title for the first page
      if (!data.previous) {
        let articleCount = 0;
        if (data.feed && Array.isArray(data.feed)) {
          articleCount = data.feed.length;

          // If we have a full page and there's a next page, show "50+"
          if (data.next && articleCount >= 50) {
            articleCount = "50+";
          }
        }

        updateTitle(articleCount);
      }

    } catch (e) {
      // Ignore parsing errors
    }
  }

  return response;
};
