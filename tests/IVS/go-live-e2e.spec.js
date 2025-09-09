import { test, expect } from "../../fixtures/sessionFixture.js";
import { GoLivePage } from "../../pages/GoLivePage.js";
import { goLiveTestData } from "../../constants/goLiveTestData.js";

test.describe("Go Live E2E Tests", () => {
  let goLivePage;
  test.beforeEach(async ({ page, context }) => {
    goLivePage = new GoLivePage(page);
    await goLivePage.gotoDashboard(goLiveTestData.dashboardUrl);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator("text=Go Live").first()).toBeVisible();
    await context.grantPermissions(["camera", "microphone"], { origin: page.url() });
    await goLivePage.goToGoLivePage();
    await expect(page).toHaveURL(/live/);
   

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
    // Optionally check for permission error or preview
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

  test("Start live with valid data", async () => {
    await goLivePage.fillStreamDetails(goLiveTestData.streamTitle, goLiveTestData.streamDescription, goLiveTestData.inviteEmail);
    await goLivePage.startStream();
    await expect(goLivePage.page.locator("(//button[normalize-space()='Stream'])[1]")).toBeVisible();
  });

  test("@smoke Stop/End live and edge case: stop again", async () => {
    await goLivePage.fillStreamDetails(goLiveTestData.streamTitle, goLiveTestData.streamDescription, goLiveTestData.inviteEmail);
    await goLivePage.startStream();
    await goLivePage.stopStream();
    await this.page.waitForSelector("text=Go Live");

    await expect(goLivePage.page.getByRole("heading", { name: goLiveTestData.welcomeBackHeading })).toBeVisible();
  });

  test("Logout from Go Live page", async () => {
    await goLivePage.logout();
    await expect(goLivePage.page).toHaveURL(/login/);
  });

  test.afterAll(async ({ page }) => {
    await page.close();
  });
});
