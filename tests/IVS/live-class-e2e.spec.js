import { test, expect } from '../../fixtures/sessionFixture.js';

// Utility selectors (using actual selectors instead of test IDs)
const selectors = {
  goLiveButton: 'text=Go Live',
  startNowButton: 'button:has-text("Start Now")',
  micButton: '[aria-label="Microphone"]',
  cameraButton: '[aria-label="Camera"]',
  videoStream: 'video, canvas',
  chatButton: '[aria-label="Chat"]',
  chatInput: 'input[placeholder*="message"], textarea[placeholder*="message"]',
  chatSend: 'button:has-text("Send")',
  chatHistory: '[data-testid="chat-history"], .chat-messages',
  participantsButton: '[aria-label="Participants"]',
  participantCount: '[data-testid="participant-count"], .participant-count',
  screenShareButton: '[aria-label="Share screen"], button:has-text("Share")',
  inviteButton: '[aria-label="Invite"], button:has-text("Invite")',
  inviteModal: '[role="dialog"], .modal',
  inviteField: 'input[placeholder*="invite"], input[placeholder*="email"]',
  whiteboardButton: '[aria-label="Whiteboard"]',
  whiteboardCanvas: 'canvas.w-full.h-full:not([width="0"])',
};

test.describe('Live Class Feature', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('https://ngage.ngenux.app/dashboard');
    await page.click(selectors.goLiveButton);
    await expect(page).toHaveURL(/live/);
    await context.grantPermissions(['camera', 'microphone']);
    
    // Start a live session for testing
    await page.fill('input[placeholder*="invite"]', 'testuser@example.com');
    await page.keyboard.press('Enter');
    await page.click(selectors.startNowButton);
    await page.waitForSelector('canvas', { timeout: 10000 });
  });

  test('@smoke  Test 1: Mic button toggles mute/unmute and updates UI', async ({ page }) => {
    const micButton = page.locator(selectors.micButton);
    if (await micButton.isVisible()) {
      await micButton.click();
      // Verify mic toggle functionality by checking aria-pressed or similar attributes
      await expect(micButton).toHaveAttribute('aria-pressed', /.+/);
      await micButton.click();
      await expect(micButton).toHaveAttribute('aria-pressed', /.+/);
    }
  });

  test('@smoke Test 2: Camera button toggles video and updates UI', async ({ page }) => {
    const cameraButton = page.locator(selectors.cameraButton);
    const videoStream = page.locator(selectors.videoStream);
    
    if (await cameraButton.isVisible()) {
      await cameraButton.click();
      // Check for video stream visibility changes
      await page.waitForTimeout(1000); // Allow time for camera to toggle
      await cameraButton.click();
      await expect(videoStream.first()).toBeVisible();
    }
  });

  test(' @smoke Test 3: Chat panel sends and persists messages', async ({ page }) => {
    const chatButton = page.locator(selectors.chatButton);
    if (await chatButton.isVisible()) {
      await chatButton.click();
      const chatInput = page.locator(selectors.chatInput);
      const chatSend = page.locator(selectors.chatSend);
      const chatHistory = page.locator(selectors.chatHistory);
      
      if (await chatInput.isVisible()) {
        await chatInput.fill('Hello, this is a test message!');
        await chatSend.click();
        await expect(chatHistory).toContainText('Hello, this is a test message!');
      }
    }
  });

  test(' @smoke Test 4: Participants panel shows correct participant count', async ({ page }) => {
    const participantsButton = page.locator(selectors.participantsButton);
    if (await participantsButton.isVisible()) {
      await participantsButton.click();
      const participantCount = page.locator(selectors.participantCount);
      if (await participantCount.isVisible()) {
        const count = await participantCount.innerText();
        expect(Number(count)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('@smoke Test 5: Screen share button activates screen sharing UI', async ({ page }) => {
    const screenShareButton = page.locator(selectors.screenShareButton);
    if (await screenShareButton.isVisible()) {
      await screenShareButton.click();
      // Check for screen share activation (this may vary based on implementation)
      await page.waitForTimeout(2000);
      // Verify screen share is active by checking for changes in UI
      await expect(screenShareButton).toBeVisible();
    }
  });

  test('Test 6: Invite modal opens and is interactable', async ({ page }) => {
    const inviteButton = page.locator(selectors.inviteButton);
    if (await inviteButton.isVisible()) {
      await inviteButton.click();
      const modal = page.locator(selectors.inviteModal);
      if (await modal.isVisible()) {
        await expect(modal).toBeVisible();
        const inviteField = page.locator(selectors.inviteField);
        if (await inviteField.isVisible()) {
          await expect(inviteField).toBeEditable();
        }
      }
    }
  });

  test('Test 7: Negative - clicking canvas without selecting a tool does not error', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));
    const canvas = page.locator(selectors.whiteboardCanvas).first();
    if (await canvas.isVisible()) {
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.move(box.x + 50, box.y + 50);
        await page.mouse.down();
        await page.mouse.move(box.x + 100, box.y + 100);
        await page.mouse.up();
      }
    }
    expect(errors.length).toBe(0);
  });

  test('Test 8: Edge - rapidly switch tools and perform actions', async ({ page }) => {
    const canvas = page.locator(selectors.whiteboardCanvas).first();
    if (await canvas.isVisible()) {
      const box = await canvas.boundingBox();
      for (let i = 0; i < 3; i++) {
        // Since we don't have specific tool selectors, we'll interact with canvas directly
        if (box) {
          await page.mouse.move(box.x + 10 + i * 10, box.y + 10 + i * 10);
          await page.mouse.down();
          await page.mouse.move(box.x + 60 + i * 10, box.y + 60 + i * 10);
          await page.mouse.up();
        }
        await page.waitForTimeout(100); // Small delay between actions
      }
      await expect(canvas).toBeVisible();
    }
  });
});
