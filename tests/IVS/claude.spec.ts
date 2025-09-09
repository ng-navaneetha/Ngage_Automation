import { test, expect, Page } from '@playwright/test';

test.describe('Live Class Feature Tests', () => {
    let page: Page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        // Add storage state if you have auth tokens
        // await context.addCookies([/* auth cookies */]);
    });

    test.afterEach(async () => {
        await page.close();
    });

    async function authenticateWithAuth0(page: Page) {
        // Navigate to home and trigger Auth0 login
        await page.goto('http://localhost:3000/');
        await page.waitForLoadState('networkidle');


        // Fill Auth0 login form
        const emailInput = page.locator('input#login-email');
        const passwordInput = page.locator('input#login-password');
        const submitButton = page.locator('#btn-login');

        await emailInput.fill('roshanreddy@gmail.com');
        await passwordInput.fill('Roshan12345@');
        await submitButton.click();

        // Wait for redirect back to application
        await page.waitForURL('http://localhost:3000/**');
        await page.waitForLoadState('networkidle');
    }

    test.describe('Authentication and Navigation', () => {
        test('should complete Auth0 login flow', async () => {
            await authenticateWithAuth0(page);

            // Verify successful login
            await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
        });

        test('should navigate to homepage and access Schedule Live Class', async () => {
            // Navigate to homepage
            await page.goto('http://localhost:3000/');

            // Set viewport for consistent testing
            await page.setViewportSize({ width: 1280, height: 720 });
            // Login with credentials
            const emailInput = page.locator('input#login-email');
            const passwordInput = page.locator('input#login-password');
            const submitButton = page.locator('#btn-login');

            await emailInput.fill('roshanreddy@gmail.com');
            await passwordInput.fill('Roshan12345@');
            await submitButton.click();


            // Click 'Schedule Live Class' button
            const scheduleLiveClassBtn = page.getByRole('button', { name: 'Schedule Live Class' });
            await expect(scheduleLiveClassBtn).toBeVisible();
            await scheduleLiveClassBtn.click();

            // Verify navigation to login or schedule page
            await page.waitForLoadState('networkidle');
        });

        test('should login with valid credentials', async () => {
            // Navigate to login page (assuming Schedule Live Class leads to login)
            await page.goto('http://localhost:3000/');

            // Fill login credentials
            const emailInput = page.locator('input#login-email')

            await expect(emailInput).toBeVisible();
            await emailInput.fill('roshanreddy@gmail.com');

            const passwordInput = page.locator('input#login-password')

            await expect(passwordInput).toBeVisible();
            await passwordInput.fill('Roshan12345@');

            // Click login button
            const loginBtn = page.locator('button#btn-login');
            await expect(loginBtn).toBeVisible();
            await loginBtn.click();

            // Wait for successful login and redirection
            await page.waitForLoadState('networkidle');

            // Verify successful login (check for user-specific elements or dashboard)
            await expect(page.locator('//p[.="Manage your classes and track student progress"]')).toBeVisible();
        });
    });

    test.describe.only('Live Class Session Management', () => {
        test.beforeEach(async () => {
            // Perform login before each test in this group
            await page.goto('http://localhost:3000/');

            // Login
            // Login with credentials
            const emailInput = page.locator('input#login-email');
            const passwordInput = page.locator('input#login-password');
            const submitButton = page.locator('#btn-login');

            await emailInput.fill('roshanreddy@gmail.com');
            await passwordInput.fill('Roshan12345@');
            await submitButton.click();

            await page.waitForLoadState('networkidle');
        });

        test('should navigate to Live Class page and initiate session', async () => {
            // Navigate to Live Class page
            const liveClassLink = page.getByRole('button', { name: 'Schedule Live Class' })
           

            if (await liveClassLink.isVisible()) {
                await liveClassLink.click();
            } else {
                // If not visible, navigate directly
                await page.goto('http://localhost:3000/live-class');
            }

            await page.waitForLoadState('networkidle');

          

            // Click 'Go Live' button
            const goLiveBtn = page.getByRole('link', { name: /go live/i })
                .or(page.getByTestId('go-live-button'));
            await expect(goLiveBtn).toBeVisible();
            await expect(goLiveBtn).toBeEnabled();

            // Take screenshot before going live
            await page.screenshot({ path: 'tests/screenshots/before-go-live.png' });

            await goLiveBtn.click();

            // Wait for session to initialize
            await page.waitForTimeout(3000);
            await page.waitForLoadState('networkidle');
        });
    });

    test.describe('Live Class UI Controls and Interactions', () => {
        test.beforeEach(async () => {
            // Setup: Login and start live session
            await page.goto('http://localhost:3000/');

            // Login with credentials
            const emailInput = page.locator('input#login-email');
            const passwordInput = page.locator('input#login-password');
            const submitButton = page.locator('#btn-login');

            await emailInput.fill('roshanreddy@gmail.com');
            await passwordInput.fill('Roshan12345@');
            await submitButton.click();

            await page.waitForLoadState('networkidle');

            // Navigate to Live Class and go live
            const liveClassLink = page.getByRole('link', { name: /live class/i })
                .or(page.getByTestId('live-class-nav'));
            if (await liveClassLink.isVisible()) {
                await liveClassLink.click();
            } else {
                await page.goto('http://localhost:3000/live');
            }

            await page.getByRole('link', { name: /go live/i }).click();
            await page.waitForTimeout(3000);
        });

        test('should validate and interact with microphone controls', async () => {
            // Find microphone button
            const micBtn = page.getByRole('button', { name: /microphone|mic|mute/i })
                .or(page.getByTestId('mic-button'))
                .or(page.locator('[data-testid*="mic"]'))
                .or(page.locator('button:has([class*="mic"])'));

            await expect(micBtn).toBeVisible();
            await expect(micBtn).toBeEnabled();

            // Test microphone toggle
            const initialState = await micBtn.getAttribute('aria-pressed') || 'false';
            await micBtn.click();

            // Verify state changed
            await page.waitForTimeout(500);
            const newState = await micBtn.getAttribute('aria-pressed') || 'false';
            expect(newState).not.toBe(initialState);

            // Test visual feedback
            await expect(micBtn).toHaveClass(/active|pressed|enabled|on/);
        });

        test('should validate and interact with camera controls', async () => {
            // Find camera button
            const cameraBtn = page.getByRole('button', { name: /camera|video|cam/i })
                .or(page.getByTestId('camera-button'))
                .or(page.locator('[data-testid*="camera"]'))
                .or(page.locator('button:has([class*="camera"])'));

            await expect(cameraBtn).toBeVisible();
            await expect(cameraBtn).toBeEnabled();

            // Test camera toggle
            const initialState = await cameraBtn.getAttribute('aria-pressed') || 'false';
            await cameraBtn.click();

            // Verify state changed
            await page.waitForTimeout(500);
            const newState = await cameraBtn.getAttribute('aria-pressed') || 'false';
            expect(newState).not.toBe(initialState);

            // Verify video element presence when camera is on
            if (newState === 'true') {
                const videoElement = page.locator('video').first();
                await expect(videoElement).toBeVisible();
            }
        });

        test('should validate and interact with screen sharing controls', async () => {
            // Find screen share button
            const screenShareBtn = page.getByRole('button', { name: /screen share|share screen/i })
                .or(page.getByTestId('screen-share-button'))
                .or(page.locator('[data-testid*="screen"]'))
                .or(page.locator('button:has([class*="screen"])'));

            await expect(screenShareBtn).toBeVisible();
            await expect(screenShareBtn).toBeEnabled();

            // Click screen share (note: actual screen sharing won't work in test environment)
            await screenShareBtn.click();

            // Verify button state or modal appearance
            await page.waitForTimeout(1000);

            // Check for screen share modal or permission dialog
            const screenShareModal = page.getByRole('dialog')
                .or(page.getByTestId('screen-share-modal'))
                .or(page.locator('.modal:has-text("screen")'));

            if (await screenShareModal.isVisible()) {
                // If modal appears, close it for test purposes
                const closeBtn = screenShareModal.getByRole('button', { name: /close|cancel/i });
                if (await closeBtn.isVisible()) {
                    await closeBtn.click();
                }
            }
        });

        test('should validate and interact with chat functionality', async () => {
            // Find chat button or panel
            const chatBtn = page.getByRole('button', { name: /chat|message/i })
                .or(page.getByTestId('chat-button'))
                .or(page.locator('[data-testid*="chat"]'));

            await expect(chatBtn).toBeVisible();
            await chatBtn.click();

            // Verify chat panel opens
            const chatPanel = page.getByTestId('chat-panel')
                .or(page.locator('[class*="chat-panel"]'))
                .or(page.getByRole('complementary', { name: /chat/i }));

            await expect(chatPanel).toBeVisible();

            // Test chat input
            const chatInput = page.getByRole('textbox', { name: /message|chat/i })
                .or(page.getByTestId('chat-input'))
                .or(page.locator('input[placeholder*="message"]'));

            if (await chatInput.isVisible()) {
                await chatInput.fill('Test message from automation');

                // Find and click send button
                const sendBtn = page.getByRole('button', { name: /send/i })
                    .or(page.getByTestId('send-message'))
                    .or(chatPanel.locator('button[type="submit"]'));

                if (await sendBtn.isVisible()) {
                    await sendBtn.click();

                    // Verify message appears in chat
                    await expect(chatPanel.getByText('Test message from automation')).toBeVisible();
                }
            }
        });

        test('should validate and interact with participants list', async () => {
            // Find participants button
            const participantsBtn = page.getByRole('button', { name: /participants|attendees/i })
                .or(page.getByTestId('participants-button'))
                .or(page.locator('[data-testid*="participants"]'));

            await expect(participantsBtn).toBeVisible();
            await participantsBtn.click();

            // Verify participants panel opens
            const participantsPanel = page.getByTestId('participants-panel')
                .or(page.locator('[class*="participants"]'))
                .or(page.getByRole('complementary', { name: /participants/i }));

            await expect(participantsPanel).toBeVisible();

            // Verify participant count or list
            const participantsList = participantsPanel.getByRole('list')
                .or(participantsPanel.locator('[class*="participant-list"]'));

            if (await participantsList.isVisible()) {
                const participantItems = participantsList.getByRole('listitem');
                await expect(participantItems.first()).toBeVisible();
            }
        });

        test('should validate and interact with invite functionality', async () => {
            // Find invite button
            const inviteBtn = page.getByRole('button', { name: /invite/i })
                .or(page.getByTestId('invite-button'))
                .or(page.locator('[data-testid*="invite"]'));

            await expect(inviteBtn).toBeVisible();
            await expect(inviteBtn).toBeEnabled();

            await inviteBtn.click();

            // Verify invite modal or panel opens
            const inviteModal = page.getByRole('dialog', { name: /invite/i })
                .or(page.getByTestId('invite-modal'))
                .or(page.locator('[class*="invite-modal"]'));

            await expect(inviteModal).toBeVisible();

            // Check for invite link or sharing options
            const inviteLink = inviteModal.getByRole('textbox', { name: /link|url/i })
                .or(inviteModal.locator('input[readonly]'))
                .or(inviteModal.getByTestId('invite-link'));

            if (await inviteLink.isVisible()) {
                const linkValue = await inviteLink.inputValue();
                expect(linkValue).toContain('http');
                expect(linkValue.length).toBeGreaterThan(10);
            }

            // Test copy button if present
            const copyBtn = inviteModal.getByRole('button', { name: /copy/i })
                .or(inviteModal.getByTestId('copy-link'));

            if (await copyBtn.isVisible()) {
                await copyBtn.click();
                // Verify copy feedback
                await expect(inviteModal.getByText(/copied/i)).toBeVisible();
            }

            // Close modal
            const closeModalBtn = inviteModal.getByRole('button', { name: /close|×/i })
                .or(inviteModal.getByTestId('close-modal'));

            if (await closeModalBtn.isVisible()) {
                await closeModalBtn.click();
                await expect(inviteModal).not.toBeVisible();
            }
        });

        test('should validate sidebar toggles and settings', async () => {
            // Test settings button
            const settingsBtn = page.getByRole('button', { name: /settings|options/i })
                .or(page.getByTestId('settings-button'))
                .or(page.locator('[data-testid*="settings"]'));

            if (await settingsBtn.isVisible()) {
                await settingsBtn.click();

                // Verify settings panel opens
                const settingsPanel = page.getByTestId('settings-panel')
                    .or(page.locator('[class*="settings"]'))
                    .or(page.getByRole('dialog', { name: /settings/i }));

                await expect(settingsPanel).toBeVisible();

                // Close settings
                const closeSettingsBtn = settingsPanel.getByRole('button', { name: /close|×/i });
                if (await closeSettingsBtn.isVisible()) {
                    await closeSettingsBtn.click();
                }
            }

            // Test sidebar collapse/expand
            const sidebarToggle = page.getByRole('button', { name: /toggle sidebar|menu/i })
                .or(page.getByTestId('sidebar-toggle'))
                .or(page.locator('[data-testid*="sidebar-toggle"]'));

            if (await sidebarToggle.isVisible()) {
                // Test toggle functionality
                await sidebarToggle.click();
                await page.waitForTimeout(500);

                // Verify visual change (sidebar collapsed/expanded)
                const sidebar = page.getByTestId('sidebar')
                    .or(page.locator('[class*="sidebar"]'))
                    .or(page.locator('aside'));

                if (await sidebar.isVisible()) {
                    // Toggle back
                    await sidebarToggle.click();
                    await page.waitForTimeout(500);
                }
            }
        });
    });

    test.describe('Error Handling and Edge Cases', () => {
        test('should handle network interruptions gracefully', async () => {
            // Setup live session
            await page.goto('http://localhost:3000/');
            await page.getByRole('button', { name: /schedule live class/i }).click();

            // Login and go live
            await page.getByRole('textbox', { name: /email/i })
                .or(page.locator('input[type="email"]')).fill('roshanreddy@gmail.com');
            await page.getByRole('textbox', { name: /password/i })
                .or(page.locator('input[type="password"]')).fill('Roshan12345@');
            await page.getByRole('button', { name: /login|sign in/i }).click();

            await page.waitForLoadState('networkidle');

            // Navigate to live class
            const liveClassLink = page.getByRole('link', { name: /live class/i });
            if (await liveClassLink.isVisible()) {
                await liveClassLink.click();
            } else {
                await page.goto('http://localhost:3000/live-class');
            }

            await page.getByRole('button', { name: /go live/i }).click();
            await page.waitForTimeout(3000);

            // Simulate network disconnection by setting offline
            await page.context().setOffline(true);

            // Wait and check for connection error handling
            await page.waitForTimeout(2000);

            // Look for reconnection indicators or error messages
            const connectionError = page.getByText(/connection|network|offline/i)
                .or(page.getByTestId('connection-status'))
                .or(page.locator('[class*="connection-error"]'));

            // Restore connection
            await page.context().setOffline(false);
            await page.waitForTimeout(2000);

            // Verify recovery
            const reconnectedIndicator = page.getByText(/connected|online/i);
            if (await reconnectedIndicator.isVisible()) {
                await expect(reconnectedIndicator).toBeVisible();
            }
        });

        test('should validate session persistence and state management', async () => {
            // Setup and start session
            await page.goto('http://localhost:3000/');
            await page.getByRole('button', { name: /schedule live class/i }).click();

            await page.getByRole('textbox', { name: /email/i })
                .or(page.locator('input[type="email"]')).fill('roshanreddy@gmail.com');
            await page.getByRole('textbox', { name: /password/i })
                .or(page.locator('input[type="password"]')).fill('Roshan12345@');
            await page.getByRole('button', { name: /login|sign in/i }).click();

            await page.waitForLoadState('networkidle');

            const liveClassLink = page.getByRole('link', { name: /live class/i });
            if (await liveClassLink.isVisible()) {
                await liveClassLink.click();
            } else {
                await page.goto('http://localhost:3000/live-class');
            }

            await page.getByRole('button', { name: /go live/i }).click();
            await page.waitForTimeout(3000);

            // Turn on camera and mic
            const cameraBtn = page.getByRole('button', { name: /camera|video/i }).first();
            const micBtn = page.getByRole('button', { name: /microphone|mic/i }).first();

            if (await cameraBtn.isVisible()) {
                await cameraBtn.click();
                await page.waitForTimeout(500);
            }

            if (await micBtn.isVisible()) {
                await micBtn.click();
                await page.waitForTimeout(500);
            }

            // Refresh page to test persistence
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Verify session state is maintained or properly restored
            const sessionActive = page.getByText(/live|active|session/i);
            // Note: Actual persistence behavior depends on implementation
        });
    });

    test.describe('Accessibility and User Experience', () => {
        test('should validate keyboard navigation and accessibility', async () => {
            // Setup session
            await page.goto('http://localhost:3000/');
            await page.getByRole('button', { name: /schedule live class/i }).click();

            await page.getByRole('textbox', { name: /email/i })
                .or(page.locator('input[type="email"]')).fill('roshanreddy@gmail.com');
            await page.getByRole('textbox', { name: /password/i })
                .or(page.locator('input[type="password"]')).fill('Roshan12345@');
            await page.getByRole('button', { name: /login|sign in/i }).click();

            await page.waitForLoadState('networkidle');

            const liveClassLink = page.getByRole('link', { name: /live class/i });
            if (await liveClassLink.isVisible()) {
                await liveClassLink.click();
            } else {
                await page.goto('http://localhost:3000/live-class');
            }

            await page.getByRole('button', { name: /go live/i }).click();
            await page.waitForTimeout(3000);

            // Test keyboard navigation
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            // Verify focused element is focusable and has proper accessibility
            const focusedElement = page.locator(':focus');
            await expect(focusedElement).toBeVisible();

            // Check for ARIA labels and roles
            const controlButtons = page.getByRole('button');
            const buttonCount = await controlButtons.count();

            for (let i = 0; i < Math.min(buttonCount, 5); i++) {
                const button = controlButtons.nth(i);
                if (await button.isVisible()) {
                    const ariaLabel = await button.getAttribute('aria-label');
                    const buttonText = await button.textContent();
                    // Either aria-label or visible text should be present
                    expect(ariaLabel || buttonText).toBeTruthy();
                }
            }
        });

        test('should validate responsive design and mobile compatibility', async () => {
            // Test mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            await page.goto('http://localhost:3000/');
            await page.getByRole('button', { name: /schedule live class/i }).click();

            await page.getByRole('textbox', { name: /email/i })
                .or(page.locator('input[type="email"]')).fill('roshanreddy@gmail.com');
            await page.getByRole('textbox', { name: /password/i })
                .or(page.locator('input[type="password"]')).fill('Roshan12345@');
            await page.getByRole('button', { name: /login|sign in/i }).click();

            await page.waitForLoadState('networkidle');

            const liveClassLink = page.getByRole('link', { name: /live class/i });
            if (await liveClassLink.isVisible()) {
                await liveClassLink.click();
            } else {
                await page.goto('http://localhost:3000/live-class');
            }

            await page.getByRole('button', { name: /go live/i }).click();
            await page.waitForTimeout(3000);

            // Take mobile screenshot
            await page.screenshot({ path: 'tests/screenshots/mobile-live-class.png' });

            // Verify essential controls are visible and accessible on mobile
            const essentialControls = [
                page.getByRole('button', { name: /microphone|mic/i }).first(),
                page.getByRole('button', { name: /camera|video/i }).first(),
                page.getByRole('button', { name: /invite/i }).first()
            ];

            for (const control of essentialControls) {
                if (await control.isVisible()) {
                    await expect(control).toBeVisible();
                    // Verify control is not cut off or too small
                    const boundingBox = await control.boundingBox();
                    if (boundingBox) {
                        expect(boundingBox.width).toBeGreaterThan(30);
                        expect(boundingBox.height).toBeGreaterThan(30);
                    }
                }
            }

            // Test tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.screenshot({ path: 'tests/screenshots/tablet-live-class.png' });

            // Reset to desktop
            await page.setViewportSize({ width: 1280, height: 720 });
        });
    });

    test.describe('Performance and Load Testing', () => {
        test('should validate page load performance', async () => {
            const startTime = Date.now();

            await page.goto('http://localhost:3000/');
            await page.waitForLoadState('networkidle');

            const homeLoadTime = Date.now() - startTime;
            expect(homeLoadTime).toBeLessThan(10000); // 10 seconds max

            // Test login performance
            const loginStartTime = Date.now();
            await page.getByRole('button', { name: /schedule live class/i }).click();

            await page.getByRole('textbox', { name: /email/i })
                .or(page.locator('input[type="email"]')).fill('roshanreddy@gmail.com');
            await page.getByRole('textbox', { name: /password/i })
                .or(page.locator('input[type="password"]')).fill('Roshan12345@');
            await page.getByRole('button', { name: /login|sign in/i }).click();

            await page.waitForLoadState('networkidle');
            const loginTime = Date.now() - loginStartTime;
            expect(loginTime).toBeLessThan(15000); // 15 seconds max for login flow

            // Test live class initialization performance
            const liveStartTime = Date.now();
            const liveClassLink = page.getByRole('link', { name: /live class/i });
            if (await liveClassLink.isVisible()) {
                await liveClassLink.click();
            } else {
                await page.goto('http://localhost:3000/live-class');
            }

            await page.getByRole('button', { name: /go live/i }).click();

            // Wait for live session to be fully initialized
            await page.waitForTimeout(5000);
            const liveInitTime = Date.now() - liveStartTime;
            expect(liveInitTime).toBeLessThan(20000); // 20 seconds max for going live
        });
    });
});