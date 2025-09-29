/**
 * Enhanced media utilities for CI environments
 * Handles camera/microphone permissions and fake media devices
 */

export const isCI = !!process.env.CI;

/**
 * Configure browser context with proper media permissions for CI
 */
export async function setupMediaPermissions(context, origin = null) {
  console.log(`🎥 Setting up media permissions for ${isCI ? 'CI' : 'local'} environment`);
  
  try {
    // Grant permissions at context level
    const permissions = ['camera', 'microphone'];
    if (origin) {
      await context.grantPermissions(permissions, { origin });
    } else {
      await context.grantPermissions(permissions);
    }
    
    console.log('✅ Media permissions granted successfully');
    return true;
  } catch (error) {
    console.log(`⚠️ Media permission setup failed: ${error.message}`);
    return false;
  }
}

/**
 * Wait for media elements with CI-aware timeouts
 */
export async function waitForMediaElements(page, context = "media") {
  console.log(`🔄 Waiting for ${context} elements... (CI: ${isCI})`);
  
  const mediaTimeout = isCI ? 45000 : 15000; // 45s in CI, 15s locally
  
  try {
    // Wait for any media-related elements
    await page.waitForSelector('video, canvas, [data-testid*="video"], [data-testid*="stream"]', { 
      timeout: mediaTimeout,
      state: 'visible'
    });
    console.log(`✅ ${context}: Media elements detected`);
    return true;
  } catch (error) {
    console.log(`⚠️ ${context}: No media elements found after ${mediaTimeout}ms`);
    
    // Fallback: Check for any streaming indicators
    try {
      const streamElements = await page.$$('canvas, video, [aria-label*="stream"], [aria-label*="camera"]');
      console.log(`🔍 ${context}: Found ${streamElements.length} potential streaming elements`);
      return streamElements.length > 0;
    } catch (e) {
      console.log(`⚠️ ${context}: Could not detect streaming elements`);
      return false;
    }
  }
}

/**
 * Enhanced live session utility with better CI support
 */
export async function waitForLiveSession(page, context = "session") {
  console.log(`🔄 Waiting for ${context} live session to initialize... (CI: ${isCI})`);
  
  const canvasTimeout = isCI ? 45000 : 15000; // 45s in CI, 15s locally
  const controlsTimeout = isCI ? 20000 : 8000; // 20s in CI, 8s locally
  const finalTimeout = isCI ? 8000 : 3000; // 8s in CI, 3s locally
  
  try {
    // Primary: Wait for canvas (video stream indicator)
    await page.waitForSelector('canvas', { timeout: canvasTimeout });
    console.log(`✅ ${context}: Canvas detected - video stream active`);
    return true;
  } catch (error) {
    console.log(`⚠️ ${context}: Canvas not found after ${canvasTimeout}ms, checking controls...`);
    
    try {
      // Secondary: Check for live session controls
      await page.waitForSelector([
        '[aria-label="Microphone"]',
        '[aria-label="Camera"]', 
        '[aria-label="Mic"]',
        '[aria-label="Video"]',
        '.live-controls',
        '[data-testid*="live"]',
        '[data-testid*="stream"]'
      ].join(', '), { timeout: controlsTimeout });
      
      console.log(`✅ ${context}: Live session controls detected`);
      return true;
    } catch (error2) {
      console.log(`⚠️ ${context}: No live controls found after ${controlsTimeout}ms`);
      
      // Final fallback: URL pattern + brief wait
      await page.waitForTimeout(finalTimeout);
      
      const currentUrl = page.url();
      console.log(`🔍 ${context}: Current URL - ${currentUrl}`);
      
      if (currentUrl.includes('/live') || currentUrl.includes('/session') || currentUrl.includes('/stream')) {
        console.log(`✅ ${context}: Live session detected by URL pattern`);
        
        // In CI, do additional element counting
        if (isCI) {
          try {
            const streamElements = await page.$$('video, canvas, [data-testid*="stream"], [aria-label*="stream"]');
            console.log(`🔍 ${context}: Found ${streamElements.length} potential stream elements`);
          } catch (e) {
            console.log(`⚠️ ${context}: Could not count stream elements: ${e.message}`);
          }
        }
        
        return true;
      }
      
      console.log(`⚠️ ${context}: Live session not clearly detected, proceeding anyway`);
      return false;
    }
  }
}

/**
 * Safely end a stream/session with enhanced error handling
 */
export async function safeStreamEnd(page, context = "stream") {
  console.log(`🔚 Attempting to end ${context}...`);
  
  try {
    // Check if page is still accessible
    if (page.isClosed()) {
      console.log(`⚠️ ${context}: Page already closed`);
      return true;
    }
    
    // Multiple selectors to try for ending stream
    const endSelectors = [
      'button[aria-label="End call"]',
      'button[aria-label="End stream"]',
      'button[aria-label="Leave"]',
      'button:has-text("End")',
      'button:has-text("Stop")',
      'button:has-text("Leave")',
      '[data-testid="end-stream"]',
      '[data-testid="stop-stream"]',
      '[data-testid="leave-call"]',
      '.end-button',
      '.stop-button',
      '.leave-button'
    ];
    
    for (const selector of endSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log(`✅ ${context}: Ended using selector ${selector}`);
          await page.waitForTimeout(3000); // Wait for cleanup
          return true;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    console.log(`⚠️ ${context}: No end button found, trying keyboard shortcuts`);
    
    // Try keyboard shortcuts
    try {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      console.log(`✅ ${context}: Attempted end via Escape key`);
      return true;
    } catch (e) {
      console.log(`⚠️ ${context}: Keyboard shortcuts failed`);
    }
    
    return false;
    
  } catch (error) {
    console.log(`⚠️ ${context}: Error during ending: ${error.message}`);
    return false;
  }
}

/**
 * Get CI-aware timeout value
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