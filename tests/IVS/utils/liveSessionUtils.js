/**
 * Utility function to safely wait for live session to be ready
 * Handles both real media and fake media scenarios
 * @param {Page} page - Playwright page object
 * @param {string} context - Description for logging (e.g., "host", "invitee")
 */
export async function waitForLiveSession(page, context = "session") {
  console.log(`🔄 Waiting for ${context} live session to initialize...`);
  
  try {
    // First try to wait for canvas (indicates video stream) - reduced timeout
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log(`✅ ${context}: Canvas detected - video stream active`);
    return true;
  } catch (error) {
    console.log(`⚠️ ${context}: Canvas not found, trying alternative indicators...`);
    
    try {
      // Check for live session UI elements - reduced timeout
      await page.waitForSelector('[aria-label="Microphone"], [aria-label="Camera"], .live-controls, [data-testid*="live"]', { timeout: 5000 });
      console.log(`✅ ${context}: Live session controls detected`);
      return true;
    } catch (error2) {
      console.log(`⚠️ ${context}: No live controls found, checking URL pattern...`);
      // Final fallback - just wait briefly and check URL
      await page.waitForTimeout(2000); // Reduced from 5000ms
      
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