export class GoLivePage {
  constructor(page) {
    this.page = page;
    this.streamSettings = page.locator("text=Stream Settings");
    this.recordSwitch = page.locator('button#record[role="switch"]');
    this.allowBroadcastSwitch = page.locator(
      'button[role="switch"]#allow-broadcast'
    );
    this.cameraPreview = page.locator("text=Click to turn on camera");
    this.micDropdown = page.locator(
      'label:has-text("Microphone") ~ div select, select'
    );
    this.startNowRadio = page.locator("text=Start Immediately");
    this.scheduleRadio = page.locator("text=Schedule for Later");
    this.startButton = page.locator('button:has-text("Start Now")');
    this.titleInput = page.locator(
      'input[placeholder="Enter stream title"], input[placeholder="Title"]'
    );
    this.descriptionInput = page.locator(
      'textarea[placeholder*="Enter meeting description..."]'
    );
    this.inviteInput = page.locator('input[placeholder*="invite"]');
    this.stopButton = page.locator('//button[@aria-label="End call"]');
    this.profileMenu = page.locator('[data-testid="profile-menu"]');
    this.logoutButton = page.locator("text=Logout");
  }

  async gotoDashboard(url) {
    await this.page.goto(url);
    await this.page.waitForSelector("text=Go Live");
  }

  //go to go live page
  async goToGoLivePage() {
    await this.page.click("text=Go Live");
  }

  async expandStreamSettings() {
    await this.streamSettings.click();
  }

  async toggleRecordSwitch() {
    const wasChecked = await this.recordSwitch.getAttribute("aria-checked");
    await this.recordSwitch.click();
    return (
      wasChecked !== (await this.recordSwitch.getAttribute("aria-checked"))
    );
  }

  async toggleAllowBroadcastSwitch() {
    if ((await this.allowBroadcastSwitch.count()) > 0) {
      const wasChecked = await this.allowBroadcastSwitch.getAttribute(
        "aria-checked"
      );
      await this.allowBroadcastSwitch.click();
      return (
        wasChecked !==
        (await this.allowBroadcastSwitch.getAttribute("aria-checked"))
      );
    }
    return null;
  }

  async collapseStreamSettings() {
    await this.streamSettings.click();
  }

  async interactCameraPreview() {
    await this.cameraPreview.click();
  }

  async selectMicOption(index = 0) {
    if (await this.micDropdown.isVisible()) {
      await this.micDropdown.selectOption({ index });
    }
  }

  async chooseStartOption(schedule = false) {
    if (schedule) {
      await this.scheduleRadio.click();
    } else {
      await this.startNowRadio.click();
    }
  }

  async fillStreamDetails(title, description, invite) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.inviteInput.fill(invite);
    await this.page.keyboard.press("Enter");
  }

  async startStream() {
    await this.startButton.click();
  }

  async stopStream() {
    if (await this.stopButton.isVisible()) {
      await this.page.waitForFunction((btn) => !btn.disabled, this.stopButton);

      // Now click safely
      await this.stopButton.click();
    }
  }

  async logout() {
    if (await this.profileMenu.isVisible()) {
      await this.profileMenu.click();
      if (await this.logoutButton.isVisible()) {
        await this.logoutButton.click();
      }
    }
  }
}
