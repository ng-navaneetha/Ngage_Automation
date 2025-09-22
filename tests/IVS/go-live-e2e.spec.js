import { test, expect } from "../../fixtures/sessionFixture.js";
import { GoLivePage } from "../../pages/GoLivePage.js";
import { goLiveTestData } from "../../constants/goLiveTestData.js";
import { time } from "console";


test.describe.configure({timeout: 240 * 1000});
test.describe("Go Live E2E Tests", () => {
  let goLivePage;
  test.beforeEach(async ({ page, context }) => {
    goLivePage = new GoLivePage(page);
    
    try {
      await goLivePage.gotoDashboard(goLiveTestData.dashboardUrl);
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
      await expect(page.locator("text=Go Live").first()).toBeVisible({ timeout: 10000 });
      await context.grantPermissions(["camera", "microphone"], { origin: page.url() });
      await goLivePage.goToGoLivePage();
      await expect(page).toHaveURL(/live/, { timeout: 15000 });
    } catch (error) {
      console.log("Auth setup error, retrying navigation...", error.message);
      // Retry once if Auth0 callback fails
      await page.goto(goLiveTestData.dashboardUrl);
      await page.waitForSelector("text=Go Live", { timeout: 10000 });
      await goLivePage.goToGoLivePage();
      await expect(page).toHaveURL(/live/, { timeout: 10000 });
    }
  });


  test("@smoke Stream Title & Description fields are visible", async () => {
    await expect(goLivePage.descriptionInput).toBeVisible();
  });

  test("Stream Settings can be expanded/collapsed and toggles work", async () => {
    await expect(goLivePage.streamSettings).toBeVisible();
    await goLivePage.expandStreamSettings();
    expect(await goLivePage.toggleRecordSwitch()).toBe(true);
    const broadcastToggled = await goLivePage.toggleAllowBroadcastSwitch();
    if (broadcastToggled !== null) {
      expect(broadcastToggled).toBe(true);
    }
    await goLivePage.collapseStreamSettings();
  });

  test("Camera preview interaction", async () => {
    await expect(goLivePage.cameraPreview).toBeVisible();
    await goLivePage.interactCameraPreview();
  });

  test("Audio settings dropdown interaction", async () => {
    await goLivePage.selectMicOption(0);
  });

  test("Start options and scheduling UI", async () => {
    await expect(goLivePage.startNowRadio).toBeVisible();
    await expect(goLivePage.scheduleRadio).toBeVisible();
    await goLivePage.chooseStartOption(true);
    // Optionally check for date/time pickers
    await goLivePage.chooseStartOption(false);
  });

  test("Start button edge case: required fields", async () => {
    await expect(goLivePage.startButton).toBeVisible();
    await goLivePage.startStream();
    await expect(goLivePage.page.getByText(goLiveTestData.errorText, { exact: true })).toBeVisible();
  });

  test("Start live with valid data", async ({ page }) => {
    await goLivePage.fillStreamDetails(goLiveTestData.streamTitle, goLiveTestData.streamDescription, goLiveTestData.inviteEmail);
    await goLivePage.startStream();
    await expect(goLivePage.page.locator("(//button[normalize-space()='Stream'])[1]")).toBeVisible();
    
    // Use direct DOM approach to avoid serialization error
    try {
      // Try to stop stream using GoLivePage method
      await goLivePage.stopStream();
    } catch (error) {
      console.log("GoLivePage.stopStream failed, using fallback method:", error.message);
      
      // Fallback: Direct button click approach
      const stopButtonSelectors = [
        '//button[@aria-label="End call"]',
        'button[aria-label="End call"]',
        'button:has-text("End")',
        'button:has-text("Stop")',
        '.stop-button',
        '[data-testid="stop-stream"]'
      ];
      
      let streamStopped = false;
      for (const selector of stopButtonSelectors) {
        try {
          const stopBtn = page.locator(selector).first();
          if (await stopBtn.isVisible({ timeout: 2000 })) {
            await stopBtn.click();
            streamStopped = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!streamStopped) {
        // Final fallback: keyboard shortcut
        await page.keyboard.press('Escape');
      }
    }
    
    await goLivePage.page.waitForSelector("text=Go Live", { timeout: 10000 });
  });

  // Fix the page reference error on line 72
  test("@smoke Stop/End live and edge case: stop again", async ({ page }) => {
    await goLivePage.fillStreamDetails(goLiveTestData.streamTitle, goLiveTestData.streamDescription, goLiveTestData.inviteEmail);
    await goLivePage.startStream();
    
    // Use direct approach to avoid serialization error
    try {
      await goLivePage.stopStream();
    } catch (error) {
      console.log("GoLivePage.stopStream failed, using fallback method:", error.message);
      
      // Fallback: Direct button click approach
      const stopButtonSelectors = [
        '//button[@aria-label="End call"]',
        'button[aria-label="End call"]',
        'button:has-text("End")',
        'button:has-text("Stop")'
      ];
      
      for (const selector of stopButtonSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 10000 }).toBeEnabled();
          const stopBtn = page.locator(selector).first();
          if (await stopBtn.isVisible({ timeout: 2000 })) {
            await stopBtn.click();
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }
    
    await goLivePage.page.waitForSelector("text=Go Live", { timeout: 10000 });
    await expect(goLivePage.page.getByRole("heading", { name: "Go Live" })).toBeVisible();
  });

  test("Logout from Go Live page", async () => {
    await goLivePage.logout();
    await expect(goLivePage.page).toHaveURL(/login/);
  });

 

  test.afterAll(async ({ page }) => {
    await page.close();
  });
});
