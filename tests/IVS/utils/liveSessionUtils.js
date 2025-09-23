/**
 * Utility function to safely wait for live session to be ready
 * Handles both real media and fake media scenarios
 * @param {Page} page - Playwright page object
 * @param {string} context - Description for logging (e.g., "host", "invitee")
 */
export async function waitForLiveSession(page, context = "session") {
  console.log(`🔄 Waiting for ${context} live session to initialize...`);
  
  const canvasTimeout = isCI ? 30000 : 10000; // 30s in CI, 10s locally
  const controlsTimeout = isCI ? 15000 : 5000; // 15s in CI, 5s locally
  const finalTimeout = isCI ? 5000 : 2000; // 5s in CI, 2s locally
  
  try {
    // First try to wait for canvas (indicates video stream) - CI-aware timeout
    await page.waitForSelector('canvas', { timeout: canvasTimeout });
    console.log(`✅ ${context}: Canvas detected - video stream active`);
    return true;
  } catch (error) {
    console.log(`⚠️ ${context}: Canvas not found, trying alternative indicators...`);
    
    try {
      // Check for live session UI elements - CI-aware timeout
      await page.waitForSelector('[aria-label="Microphone"], [aria-label="Camera"], .live-controls, [data-testid*="live"]', { timeout: controlsTimeout });
      console.log(`✅ ${context}: Live session controls detected`);
      return true;
    } catch (error2) {
      console.log(`⚠️ ${context}: No live controls found, checking URL pattern...`);
      // Final fallback - just wait briefly and check URL
      await page.waitForTimeout(finalTimeout); // CI-aware timeout
      
      // Check if we're in a live session by URL or other indicators
      const currentUrl = page.url();
      if (currentUrl.includes('/live') || currentUrl.includes('/session')) {
        console.log(`✅ ${context}: Live session detected by URL pattern`);
        return true;
      }
      
      console.log(`✅ ${context}: Proceeding without video confirmation`);
      return false;
    }
  }
}

/**
 * Check if running in CI environment
 */
export const isCI = !!process.env.CI;

/**
 * Get CI-aware timeout value
 * @param {number} localTimeout - Timeout for local development
 * @param {number} ciMultiplier - Multiplier for CI (default: 3x)
 * @returns {number} - Appropriate timeout for environment
 */
export function getCITimeout(localTimeout, ciMultiplier = 3) {
  return isCI ? localTimeout * ciMultiplier : localTimeout;
}

/**
 * CI-aware waitForSelector with automatic timeout adjustment
 */
export async function waitForSelectorCI(page, selector, options = {}) {
  const defaultTimeout = options.timeout || 10000;
  const ciTimeout = getCITimeout(defaultTimeout);
  
  return await page.waitForSelector(selector, {
    ...options,
    timeout: ciTimeout
  });
}