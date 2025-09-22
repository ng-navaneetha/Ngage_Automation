import { test, expect } from "../../fixtures/sessionFixture.js";
import { INVITEE_CREDENTIALS, HOST_CREDENTIALS, POLL_TEST_DATA } from "../../constants/pollTestData.js";
import { waitForLiveSession } from './utils/liveSessionUtils.js';


test.describe.configure({ timeout: 250 * 1000 });
test.describe('Live Poll End-to-End', () => {
  
  test.afterEach(async ({ page }) => {
    // End the stream after each test using the same flow as whiteboard tests
    
    console.log("Ending stream after poll test...");
    try {
      await page.getByRole("tab", { name: "Stream" }).click();
      await page.waitForTimeout(1000);
      
      // Try multiple selectors for end button (reference from whiteboard file)
      const endButtonSelectors = [
        '//button[@aria-label="End call"]',
        'button[aria-label="End call"]',
        'button:has-text("End")',
        'button:has-text("Stop")',
        'button:has-text("Leave")'
      ];

      let streamEnded = false;
      for (const selector of endButtonSelectors) {
        try {
          const endButton = page.locator(selector).first();
          if (await endButton.isVisible({ timeout: 2000 })) {
            await endButton.click();
            streamEnded = true;
            console.log(`Stream ended using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
          console.log(`Selector ${selector} not found, trying next...`);
        }
      }

      if (streamEnded) {
        // Wait for stream to end properly and redirect to dashboard
        await page.waitForSelector("text=Go Live", { timeout: 10000 });
        await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
        console.log("Stream ended successfully - redirected to dashboard");
      } else {
        console.log("Could not find end button - trying fallback methods");
        
        // Fallback method 1: Try keyboard shortcut
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
        
        // Fallback method 2: Navigate directly to dashboard
        await page.goto(HOST_CREDENTIALS.dashboardUrl);
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log("Error during stream ending:", error.message);
      
      // Final fallback: Navigate to dashboard directly
      try {
        await page.goto(HOST_CREDENTIALS.dashboardUrl);
        console.log("Navigated to dashboard as fallback");
      } catch (fallbackError) {
        console.log("Fallback navigation failed:", fallbackError.message);
      }
    }
  });

  test('@smoke Host creates poll, invitee votes, and results update', async ({ page, context, browser }) => {
    // Host flow - using session storage
    await page.goto(HOST_CREDENTIALS.dashboardUrl);
    await page.click('text=Go Live');
    await context.grantPermissions(['camera', 'microphone']);

    // Allow camera/mic permissions if prompted (manual step or browser context config)
    // Invite participant
    await page.fill('input[placeholder*="invite"]', INVITEE_CREDENTIALS.email);
    await page.keyboard.press('Enter');
    await page.click('button:has-text("Start Now")');
    await waitForLiveSession(page, "host-main-test"); // Wait until live session is ready


    // Get poll URL
    const pollUrl = page.url();

    // Invitee flow - create completely isolated context
    const inviteeContext = await browser.newContext({
      storageState: undefined, // No stored authentication state
      ignoreHTTPSErrors: true,
      acceptDownloads: true
    });
    const inviteePage = await inviteeContext.newPage();
    await inviteePage.goto(pollUrl);
    
    // Check if redirected to login page and handle authentication
    await inviteePage.waitForURL(/auth0\.com\/login|\/login/, { timeout: 10000 });
    await inviteePage.fill('#login-email', INVITEE_CREDENTIALS.email);
    await inviteePage.fill('#login-password', INVITEE_CREDENTIALS.password);
    await inviteePage.click('#btn-login');
    
    // Wait to be redirected back to the poll/live session
    await inviteeContext.grantPermissions(['camera', 'microphone']);
    await waitForLiveSession(inviteePage, "invitee"); // Wait until live session is ready

    // Open Poll UI
    await page.click("(//button[@aria-label='Poll'])[1]");
    await page.click('button:has-text("Create New")');
    await page.fill('input[placeholder="Enter title"]', POLL_TEST_DATA.pollTitle);
    await page.fill('input[placeholder="Enter your question"]', POLL_TEST_DATA.pollQuestion);
    await page.fill('input[placeholder="Option 1"]', POLL_TEST_DATA.option1);
    await page.fill('input[placeholder="Option 2"]', POLL_TEST_DATA.option2);
    await page.getByRole('combobox').filter({ hasText: 'seconds' }).click();
    await page.getByRole('option', { name: POLL_TEST_DATA.duration }).click();
    await page.click('button:has-text("Save Poll")');
    await page.click('button:has-text("Launch")');
    await page.click('button:has-text("Broadcast to All")');

    await page.waitForTimeout(2000); // Wait for poll to be launched

    await inviteePage.click('button:has-text("Take Poll Now")');
    await inviteePage.click(`text=${POLL_TEST_DATA.option1}`);
    await inviteePage.click('button:has-text("Submit Answer")');
    // Assert vote registered
    await expect(inviteePage.locator('text=100%')).toBeVisible();

    // Host sees updated results
    
    await page.click('button:has-text("Poll")');
    await expect(page.locator('text=100%')).toBeVisible();

  });

  test('Host cannot create poll with empty question or options', async ({ page, context }) => {
    await page.goto(HOST_CREDENTIALS.dashboardUrl);
    await page.click('text=Go Live');
    await context.grantPermissions(['camera', 'microphone']);
    await page.fill('input[placeholder*="invite"]', INVITEE_CREDENTIALS.email);
    await page.keyboard.press('Enter');
    await page.click('button:has-text("Start Now")');
    await page.click("(//button[@aria-label='Poll'])[1]");
    await page.click('button:has-text("Create New")');
    // Try to save poll with empty fields
    await page.click('button:has-text("Save Poll")');
    await expect(page.locator('text=Title is required')).toBeVisible();
    await page.fill('input[placeholder="Enter title"]', 'Test Poll');
    await page.click('button:has-text("Save Poll")');
    await expect(page.locator('text=Question text is required')).toBeVisible();
    await page.fill('input[placeholder="Enter your question"]', 'Q?');
    await page.click('button:has-text("Save Poll")');
    await expect(page.locator('text=All options must have text')).toBeVisible();
  });

  test('Invitee cannot vote twice in the same poll', async ({ page, context, browser }) => {
     // Host flow - using session storage
    await page.goto(HOST_CREDENTIALS.dashboardUrl);
    await page.click('text=Go Live');
    await context.grantPermissions(['camera', 'microphone']);

    // Allow camera/mic permissions if prompted (manual step or browser context config)
    // Invite participant
    await page.fill('input[placeholder*="invite"]', INVITEE_CREDENTIALS.email);
    await page.keyboard.press('Enter');
    await page.click('button:has-text("Start Now")');
    await waitForLiveSession(page, "host-second-test"); // Wait until live session is ready


    // Get poll URL
    const pollUrl = page.url();

    // Invitee flow - create completely isolated context
    const inviteeContext = await browser.newContext({
      storageState: undefined, // No stored authentication state
      ignoreHTTPSErrors: true,
      acceptDownloads: true
    });
    const inviteePage = await inviteeContext.newPage();
    await inviteePage.goto(pollUrl);
    
    // Check if redirected to login page and handle authentication
    await inviteePage.waitForURL(/auth0\.com\/login|\/login/, { timeout: 10000 });
    await inviteePage.fill('#login-email', INVITEE_CREDENTIALS.email);
    await inviteePage.fill('#login-password', INVITEE_CREDENTIALS.password);
    await inviteePage.click('#btn-login');
    
    // Wait to be redirected back to the poll/live session
    await inviteePage.waitForURL(/live/, { timeout: 15000 });
    await inviteeContext.grantPermissions(['camera', 'microphone']);
    await waitForLiveSession(inviteePage, "invitee-second-test"); // Wait until live session is ready

    // Open Poll UI
    await page.click("(//button[@aria-label='Poll'])[1]");
    await page.click('button:has-text("Create New")');
    await page.fill('input[placeholder="Enter title"]', POLL_TEST_DATA.pollTitle);
    await page.fill('input[placeholder="Enter your question"]', POLL_TEST_DATA.pollQuestion);
    await page.fill('input[placeholder="Option 1"]', POLL_TEST_DATA.option1);
    await page.fill('input[placeholder="Option 2"]', POLL_TEST_DATA.option2);
    await page.getByRole('combobox').filter({ hasText: 'seconds' }).click();
    await page.getByRole('option', { name: POLL_TEST_DATA.duration }).click();
    await page.click('button:has-text("Save Poll")');
    await page.click('button:has-text("Launch")');
    await page.click('button:has-text("Broadcast to All")');

    await page.waitForTimeout(2000); // Wait for poll to be launched

    await inviteePage.click('button:has-text("Take Poll Now")');
    await inviteePage.click(`text=${POLL_TEST_DATA.option1}`);
    await inviteePage.click('button:has-text("Submit Answer")');
    // Try to vote again
    await expect(inviteePage.locator('button:has-text("Submit")')).not.toBeVisible();
  });
});
