export class StartClassPage {
  constructor(page) {
    this.page = page;
    
    // Navigation elements
    this.startClassButton = page.locator("text=Start a Class");
    this.dashboardLink = page.locator("text=Dashboard");
    
    // Class setup elements
    this.classTitle = page.locator('input[placeholder*="class title"], input[placeholder*="Class Title"]');
    this.classDescription = page.locator('textarea[placeholder*="class description"], textarea[placeholder*="Description"]');
    this.inviteInput = page.locator('input[placeholder*="invite"], input[placeholder*="email"]');
    this.startClassNowButton = page.locator('button:has-text("Start Class"), button:has-text("Start Now")');
    this.scheduleClassButton = page.locator('button:has-text("Schedule Class")');
    
    // Class settings
    this.classSettings = page.locator("text=Class Settings");
    this.enableRecordingSwitch = page.locator('button#recording[role="switch"]');
    this.enableChatSwitch = page.locator('button#chat[role="switch"]');
    this.enableWhiteboardSwitch = page.locator('button#whiteboard[role="switch"]');
    this.enablePollsSwitch = page.locator('button#polls[role="switch"]');
    
    // Media controls
    this.cameraPreview = page.locator("text=Click to turn on camera");
    this.microphoneDropdown = page.locator('select[aria-label*="microphone"], select[aria-label*="Microphone"]');
    this.cameraDropdown = page.locator('select[aria-label*="camera"], select[aria-label*="Camera"]');
    
    // In-class elements
    this.classActiveIndicator = page.locator("text=Class is Live");
    this.participantsList = page.locator('[data-testid="participants-list"]');
    this.chatPanel = page.locator('[data-testid="chat-panel"]');
    this.chatInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]');
    this.sendChatButton = page.locator('button[aria-label*="Send"], button:has-text("Send")');
    this.chatMessages = page.locator('[data-testid="chat-messages"] .message');
    
    // Interactive features
    this.whiteboardTab = page.locator('button[role="tab"]:has-text("Whiteboard")');
    this.pollsTab = page.locator('button[role="tab"]:has-text("Polls")');
    this.annotationTool = page.locator('[title="Annotation"], [aria-label*="annotation"]');
    this.createPollButton = page.locator('button:has-text("Create Poll")');
    this.pollQuestion = page.locator('input[placeholder*="poll question"], textarea[placeholder*="question"]');
    this.pollOption = page.locator('input[placeholder*="option"]');
    this.publishPollButton = page.locator('button:has-text("Publish Poll")');
    
    // Class control elements
    this.endClassButton = page.locator('button:has-text("End Class"), button[aria-label*="End"]');
    this.leaveClassButton = page.locator('button:has-text("Leave Class")');
    this.muteButton = page.locator('button[aria-label*="Mute"]');
    this.unmuteButton = page.locator('button[aria-label*="Unmute"]');
    this.videoOnButton = page.locator('button[aria-label*="Video On"]');
    this.videoOffButton = page.locator('button[aria-label*="Video Off"]');
    
    // Profile and logout
    this.profileMenu = page.locator('[data-testid="profile-menu"]');
    this.logoutButton = page.locator("text=Logout");
  }

  async gotoDashboard(url) {
    await this.page.goto(url);
    await this.page.waitForSelector("text=Start a Class");
  }

  async goToStartClassPage() {
    await this.startClassButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async setupClass(title, description, inviteEmail) {
    if (await this.classTitle.isVisible()) {
      await this.classTitle.fill(title);
    }
    if (await this.classDescription.isVisible()) {
      await this.classDescription.fill(description);
    }
    if (await this.inviteInput.isVisible()) {
      await this.inviteInput.fill(inviteEmail);
      await this.page.keyboard.press('Enter');
    }
  }

  async enableClassFeatures() {
    // Enable various class features
    if (await this.classSettings.isVisible()) {
      await this.classSettings.click();
    }
    
    const features = [
      this.enableChatSwitch,
      this.enableWhiteboardSwitch,
      this.enablePollsSwitch,
      this.enableRecordingSwitch
    ];

    for (const feature of features) {
      if (await feature.isVisible()) {
        const isEnabled = await feature.getAttribute('aria-checked');
        if (isEnabled !== 'true') {
          await feature.click();
        }
      }
    }
  }

  async startClass() {
    const startTime = Date.now();
    await this.startClassNowButton.click();
    await this.page.waitForSelector("text=Class is Live", { timeout: 15000 });
    return Date.now() - startTime;
  }

  async sendChatMessage(message) {
    const startTime = Date.now();
    await this.chatInput.fill(message);
    await this.sendChatButton.click();
    return Date.now() - startTime;
  }

  async waitForChatMessage(message, timeout = 5000) {
    return await this.page.waitForFunction(
      ({ message }) => {
        const messages = document.querySelectorAll('[data-testid="chat-messages"] .message');
        return Array.from(messages).some(msg => msg.textContent.includes(message));
      },
      { message },
      { timeout }
    );
  }

  async measureLatency() {
    const measurements = [];
    const testActions = [
      () => this.page.locator('body').click(),
      () => this.chatInput.click(),
      () => this.page.mouse.move(100, 100)
    ];

    for (const action of testActions) {
      const startTime = Date.now();
      await action();
      await this.page.waitForTimeout(100);
      measurements.push(Date.now() - startTime);
    }

    return measurements.reduce((a, b) => a + b, 0) / measurements.length;
  }

  async createPoll(question, options) {
    await this.pollsTab.click();
    await this.createPollButton.click();
    await this.pollQuestion.fill(question);
    
    for (let i = 0; i < options.length; i++) {
      const optionInput = this.page.locator(`input[placeholder*="option"]:nth-child(${i + 1})`);
      if (await optionInput.isVisible()) {
        await optionInput.fill(options[i]);
      }
    }
    
    const startTime = Date.now();
    await this.publishPollButton.click();
    return Date.now() - startTime;
  }

  async addAnnotation(text) {
    await this.whiteboardTab.click();
    await this.annotationTool.click();
    
    const canvas = this.page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      const startTime = Date.now();
      await this.page.mouse.click(box.x + 100, box.y + 100);
      
      // Look for text input that appears
      const textInput = this.page.locator('input[type="text"], textarea').last();
      if (await textInput.isVisible()) {
        await textInput.fill(text);
        await this.page.keyboard.press('Enter');
      }
      
      return Date.now() - startTime;
    }
    return 0;
  }

  async getParticipantCount() {
    const participants = await this.participantsList.locator('.participant').count();
    return participants;
  }

  async endClass() {
    if (await this.endClassButton.isVisible()) {
      await this.endClassButton.click();
      // Wait for confirmation dialog and confirm
      const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
    }
  }

  async leaveClass() {
    if (await this.leaveClassButton.isVisible()) {
      await this.leaveClassButton.click();
    }
  }

  async toggleMute() {
    if (await this.muteButton.isVisible()) {
      await this.muteButton.click();
      return 'muted';
    } else if (await this.unmuteButton.isVisible()) {
      await this.unmuteButton.click();
      return 'unmuted';
    }
    return 'unchanged';
  }

  async toggleVideo() {
    if (await this.videoOnButton.isVisible()) {
      await this.videoOnButton.click();
      return 'video_off';
    } else if (await this.videoOffButton.isVisible()) {
      await this.videoOffButton.click();
      return 'video_on';
    }
    return 'unchanged';
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
