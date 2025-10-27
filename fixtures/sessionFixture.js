import fs from 'fs';
import path from 'path';
import { test as baseTest, expect } from '@playwright/test';
import { TEST_DATA } from '../constants/login_Golive';
import dotenv from 'dotenv';

// Load environment variables
const envFile = process.env.ENV_FILE || '.env.test';
dotenv.config({ path: path.resolve(envFile) });

const AUTH_FILE = 'fixtures/auth.json';
const loginUrl = TEST_DATA.dashboardUrl;
const validEmail = process.env.VALID_EMAIL || TEST_DATA.email;
const validPassword = 
  process.env.VALID_PASSWORD || TEST_DATA.password;

// Global setup - run once before all tests
let authSetupDone = false;

export async function setupLoginSession(browser) {
  // Check if auth file exists and is recent (less than 12 hours old)
  if (fs.existsSync(AUTH_FILE)) {
    const stats = fs.statSync(AUTH_FILE);
    const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
    
    if (ageInHours < 12) {
      console.log(`Using existing auth session (${ageInHours.toFixed(1)} hours old)...`);
      return;
    } else {
      console.log(`Auth session is ${ageInHours.toFixed(1)} hours old, creating new one...`);
    }
  }

  console.log('Creating new auth session...');
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto(loginUrl);
  // await page.getByRole('link', { name: 'Go to Login' }).click();
  // await page.click('text=Login');
  await page.waitForURL(/auth0\.com\/login/);
  await page.fill('#login-email', validEmail);
  await page.fill('#login-password', validPassword);
  await page.click('#btn-login');
  
  await page.waitForSelector('text=Go Live');
  await expect(page).toHaveURL(/dashboard/);

  // Save authentication state
  await context.storageState({ path: AUTH_FILE });
  console.log('Auth session saved successfully');
  
  await context.close();
}

export async function ensureAuthenticated(page) {
  try {
    // Check if we're already authenticated by looking for the Go Live button
    const goLiveButton = await page.locator('text=Go Live').isVisible({ timeout: 3000 });
    
    if (goLiveButton) {
      console.log('Already authenticated, proceeding with tests...');
      return;
    }
  } catch (error) {
    // If check fails, proceed with login
    console.log('Authentication check failed, proceeding with login...');
  }

  console.log('Not authenticated, performing login...');
  
  try {
    // Navigate to login page
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    console.log('Navigated to login URL, checking for login elements...');
    
    // Check if we're on the landing page and need to click "Go to Login"
    const goToLoginButton = await page.getByRole('link', { name: 'Go to Login' }).isVisible({ timeout: 5000 });
    console.log('Go to Login button visible:', goToLoginButton);
    
    if (goToLoginButton) {
      await page.getByRole('link', { name: 'Go to Login' }).click();
      console.log('Clicked Go to Login button');
    }
    
    // Look for the Login button/text
    const loginButton = await page.locator('text=Login').isVisible({ timeout: 5000 });
    console.log('Login button visible:', loginButton);
    
    if (loginButton) {
      await page.click('text=Login');
      console.log('Clicked Login button');
    }
    
    // Wait for Auth0 login page
    console.log('Waiting for Auth0 login page...');
    await page.waitForURL(/auth0\.com\/login/, { timeout: 15000 });
    console.log('Auth0 login page loaded');
    
    // Fill login credentials
    console.log('Filling login credentials...');
    await page.fill('#login-email', validEmail);
    await page.fill('#login-password', validPassword);
    await page.click('#btn-login');
    console.log('Submitted login form');
    
    // Wait for successful login redirect and authentication indicator
    console.log('Waiting for successful login...');
    await page.waitForSelector('text=Go Live', { 
      timeout: 30000,
      state: 'visible'
    });
    
    console.log('Login completed successfully');
    
  } catch (error) {
    console.error('Login failed:', error.message);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

export async function loginSession(page) {
  await ensureAuthenticated(page);
}

// Direct login function that doesn't use page.goto to avoid recursion
async function performDirectLogin(page, originalGoto) {
  try {
    console.log('Starting direct login process...');
    
    // Use originalGoto to avoid recursion
    await originalGoto.call(page, loginUrl, { waitUntil: 'networkidle' });
    console.log('Navigated to login URL directly');
    
    // Check if we're on the landing page and need to click "Go to Login"
    const goToLoginButton = await page.getByRole('link', { name: 'Go to Login' }).isVisible({ timeout: 5000 });
    console.log('Go to Login button visible:', goToLoginButton);
    
    if (goToLoginButton) {
      await page.getByRole('link', { name: 'Go to Login' }).click();
      console.log('Clicked Go to Login button');
    }
    
    // Look for the Login button/text
    const loginButton = await page.locator('text=Login').isVisible({ timeout: 5000 });
    console.log('Login button visible:', loginButton);
    
    if (loginButton) {
      await page.click('text=Login');
      console.log('Clicked Login button');
    }
    
    // Wait for Auth0 login page
    console.log('Waiting for Auth0 login page...');
    await page.waitForURL(/auth0\.com\/login/, { timeout: 15000 });
    console.log('Auth0 login page loaded');
    
    // Fill login credentials
    console.log('Filling login credentials...');
    await page.fill('#login-email', validEmail);
    await page.fill('#login-password', validPassword);
    await page.click('#btn-login');
    console.log('Submitted login form');
    
    // Wait for successful login redirect and authentication indicator
    console.log('Waiting for successful login...');
    await page.waitForSelector('text=Go Live', { 
      timeout: 30000,
      state: 'visible'
    });
    
    console.log('Direct login completed successfully');
    
    // Save the storage state after successful login
    console.log('Saving storage state...');
    await page.context().storageState({ path: AUTH_FILE });
    console.log('Storage state saved successfully');
    
  } catch (error) {
    console.error('Direct login failed:', error.message);
    throw new Error(`Direct authentication failed: ${error.message}`);
  }
}

// Extend base test to include login fixture
export const test = baseTest.extend({
  // Create authenticated context with conditional login
  storageState: async ({ browser }, use, testInfo) => {
    // Only run setup once globally
    if (!authSetupDone) {
      try {
        await setupLoginSession(browser);
        authSetupDone = true;
      } catch (error) {
        console.log('Auth setup failed, will retry per test:', error.message);
        // Don't set authSetupDone to true if it failed
      }
    }
    
    // Check if auth file exists and is valid
    if (fs.existsSync(AUTH_FILE)) {
      try {
        // Verify the auth file is not corrupted
        const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
        if (authData && authData.cookies && authData.cookies.length > 0) {
          console.log('Using valid auth file with cookies');
          await use(AUTH_FILE);
          return;
        }
      } catch (error) {
        console.log('Auth file is corrupted, creating new one:', error.message);
      }
    }
    
    // Fallback: create new auth if file doesn't exist or is invalid
    console.log('Creating fallback auth session...');
    await setupLoginSession(browser);
    await use(AUTH_FILE);
  },

  // Create a fresh context with saved storage state for each test
  context: async ({ browser, storageState }, use) => {
    const contextOptions = {
      storageState: storageState,
      viewport: { width: 1280, height: 720 },
      // permissions: ['camera', 'microphone']
    };

    // Add CI-specific options for better media handling
    if (process.env.CI) {
      contextOptions.ignoreHTTPSErrors = true;
      contextOptions.acceptDownloads = false;
      contextOptions.locale = 'en-US';
      contextOptions.timezoneId = 'America/New_York';
      // Enhanced media device simulation for CI
      contextOptions.mediaFeatures = [
        { name: 'prefers-reduced-motion', value: 'no-preference' }
      ];
    }

    const context = await browser.newContext(contextOptions);
    
    // Ensure media permissions are properly set
    try {
      await context.grantPermissions(['camera', 'microphone']);
      console.log('✅ Media permissions granted at context level');
    } catch (error) {
      console.log(`⚠️ Media permission setup failed: ${error.message}`);
    }
    
    await use(context);
    await context.close();
  },

  // Simple page fixture that uses the authenticated context
  page: async ({ context }, use) => {
    const page = await context.newPage();
    
    // Check authentication only when navigating to app URLs
    const originalGoto = page.goto.bind(page);
    page.goto = async (url, options) => {
      // If navigating to app URLs, check authentication
      if (url.includes('/project') || url.includes('/dashboard')) {
        console.log(`Navigating to app URL: ${url}`);
        const result = await originalGoto(url, options);
        
        // Quick check if we need to re-authenticate
        try {
          await page.waitForLoadState('networkidle', { timeout: 5000 });
          
          // Check for Go Live button to verify authentication
          const isAuthenticated = await page.locator('text=Go Live').isVisible({ timeout: 3000 });
          
          if (!isAuthenticated) {
            // Check if we're on the login page or need to navigate there
            const currentUrl = page.url();
            if (currentUrl.includes('auth0.com') || currentUrl.includes('/login')) {
              console.log('Already on login page, session expired, performing fresh login...');
            } else {
              console.log('Not authenticated and not on login page, creating new session...');
            }
            
            await performDirectLogin(page, originalGoto);
            // Navigate to the requested URL with fresh session
            console.log(`Re-navigating to ${url} with fresh auth...`);
            await originalGoto(url, options);
          } else {
            console.log('Session is valid, continuing...');
          }
        } catch (error) {
          console.log('Auth check error, continuing with current page state');
        }
        
        return result;
      } else {
        // For non-app URLs, just navigate normally
        return await originalGoto(url, options);
      }
    };
    
    await use(page);
    await page.close();
  }
});

export { expect };
