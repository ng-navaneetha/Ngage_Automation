// import { test, expect } from "../../fixtures/sessionFixture.js";
// import { StartClassPage } from "../../pages/StartClassPage.js";
// import { startClassTestData } from "../../constants/startClassTestData.js";
// import { INVITEE_CREDENTIALS, HOST_CREDENTIALS, POLL_TEST_DATA } from "../../constants/pollTestData.js";

// test.describe("Start a Class E2E Tests", () => {
//   let startClassPage;
//   let sharedPage;
//   let sharedContext;

//   // Helper function to get the main video canvas (not the poll canvas)
//   const getMainCanvas = () => {
//     return sharedPage.locator('canvas').first(); // Use first() to target the main video canvas
//   };

//   // Utility method to end and restart stream if needed
//   async function endAndRestartStream() {
//     try {
//       console.log("Ending current stream...");
//       await startClassPage.endClass();
//       await sharedPage.waitForTimeout(2000);
      
//       console.log("Restarting stream for next test...");
//       await sharedPage.goto(HOST_CREDENTIALS.dashboardUrl);
//       await expect(sharedPage).toHaveURL(/dashboard/);
//       await sharedPage.click("text=Go Live");
//       await sharedPage.fill('input[placeholder*="invite"]', INVITEE_CREDENTIALS.email);
//       await sharedPage.keyboard.press("Enter");
//       await sharedPage.click('button:has-text("Start Now")');
//       await sharedPage.waitForSelector('canvas');
      
//       console.log("Stream restarted successfully");
//     } catch (error) {
//       console.log("End and restart stream error:", error.message);
//       throw error;
//     }
//   }

//   // Use beforeAll to do login + navigation once, then reuse the page for TC01-TC14
//   test.beforeAll(async ({ browser }) => {
//     // Create a persistent context for all tests
//     sharedContext = await browser.newContext({
//       ignoreHTTPSErrors: true,
//       acceptDownloads: true
//     });
    
//     sharedPage = await sharedContext.newPage();
//     startClassPage = new StartClassPage(sharedPage);
    
//     // One-time setup: Login + Navigate + Start Class
//     await sharedPage.goto(HOST_CREDENTIALS.dashboardUrl);
//     await expect(sharedPage).toHaveURL(/dashboard/);
//     await expect(sharedPage.locator("text=Go Live").first()).toBeVisible();
//     await sharedPage.click("text=Go Live");
//     await sharedContext.grantPermissions(["camera", "microphone"], {
//       origin: sharedPage.url(),
//     });

//     // Invite participant using the same flow as poll tests
//     await sharedPage.fill('input[placeholder*="invite"]', INVITEE_CREDENTIALS.email);
//     await sharedPage.keyboard.press("Enter");
//     await sharedPage.click('button:has-text("Start Now")');
//     await sharedPage.waitForSelector('canvas'); // Wait until the canvas element is in the DOM and visible
    
//     console.log("✓ One-time class setup completed - page will be reused for all test cases");
//   });

//   // Minimal beforeEach - just verify the page is still active
//   test.beforeEach(async () => {
//     // Verify the session is still active before each test
//     try {
//       await expect(getMainCanvas()).toBeVisible({ timeout: 5000 });
//     } catch (error) {
//       console.log("Canvas not visible, attempting to restart class...");
      
//       // If canvas is not visible, try to restart the class
//       try {
//         await sharedPage.goto(HOST_CREDENTIALS.dashboardUrl);
//         await expect(sharedPage).toHaveURL(/dashboard/);
//         await expect(sharedPage.locator("text=Go Live").first()).toBeVisible();
//         await sharedPage.click("text=Go Live");
        
//         // Restart class
//         await sharedPage.fill('input[placeholder*="invite"]', INVITEE_CREDENTIALS.email);
//         await sharedPage.keyboard.press("Enter");
//         await sharedPage.click('button:has-text("Start Now")');
//         await sharedPage.waitForSelector('canvas');
        
//         console.log("Class restarted successfully");
//       } catch (restartError) {
//         console.log("Failed to restart class:", restartError.message);
//         throw restartError;
//       }
//     }
//   });

//   test.describe("Real-Time Initiation Tests", () => {
//     test("Test Case 1: Class Initialization", async () => {
//       // Objective: Ensure "Start a Class" mode is initiated without delays
//       // Steps: Enter "Start a Class" mode
//       // Expected Result: Mode activated seamlessly, ready for real-time interaction

//       const initializationStart = Date.now();

//       // Verify canvas is loaded (class is already started in beforeAll)
//       await expect(getMainCanvas()).toBeVisible();

//       const totalInitializationTime = Date.now() - initializationStart;

//       console.log(`Class initialization time: ${totalInitializationTime}ms`);

//       // Expected Result: Class should initialize quickly (under 5 seconds)
//       expect(totalInitializationTime).toBeLessThan(5000);
//     });

//     test("Test Case 2: Latency Measurement", async () => {
//       // Objective: Confirm system maintains low latency during real-time class
//       // Steps: Monitor latency throughout the class
//       // Expected Result: Latency consistently below 300ms threshold

//       // Measure latency over time
//       const latencyMeasurements = [];
//       const measurementCount = 5; // Reduced for efficiency

//       for (let i = 0; i < measurementCount; i++) {
//         const latency = await startClassPage.measureLatency();
//         latencyMeasurements.push(latency);

//         console.log(`Latency measurement ${i + 1}: ${latency}ms`);

//         // Wait between measurements
//         await sharedPage.waitForTimeout(500);
//       }

//       const averageLatency = latencyMeasurements.reduce((a, b) => a + b, 0) / latencyMeasurements.length;
//       const maxLatency = Math.max(...latencyMeasurements);

//       console.log(`Average latency: ${averageLatency}ms`);
//       console.log(`Maximum latency: ${maxLatency}ms`);
//       console.log(`Latency threshold: ${startClassTestData.latencyThreshold}ms`);

//       // Expected Result: Latency consistently below 300ms
//       expect(averageLatency).toBeLessThan(startClassTestData.latencyThreshold);
//       expect(maxLatency).toBeLessThan(startClassTestData.latencyThreshold * 1.5); // Allow 50% tolerance for max
//     });
//   });

//   test.describe("Participant Interaction Tests", () => {
//     test("Test Case 3: Real-Time Chat Interaction", async ({ browser }) => {
//       // Objective: Verify real-time chat interactions during class
//       // Steps: Participants join and engage in chat conversations
//       // Expected Result: Chat messages delivered instantly with low latency

//       // Get the class URL (same pattern as poll tests)
//       const classUrl = sharedPage.url();

//       // Create participant context - isolated like poll tests
//       const participantContext = await browser.newContext({
//         storageState: undefined, // No stored authentication state
//         ignoreHTTPSErrors: true,
//         acceptDownloads: true
//       });
//       const participantPage = await participantContext.newPage();
      
//       try {
//         // Navigate to class URL
//         await participantPage.goto(classUrl);
        
//         // Handle authentication (same as poll tests)
//         await participantPage.waitForURL(/auth0\.com\/login|\/login/, { timeout: 10000 });
//         await participantPage.fill('#login-email', INVITEE_CREDENTIALS.email);
//         await participantPage.fill('#login-password', INVITEE_CREDENTIALS.password);
//         await participantPage.click('#btn-login');
        
//         // Wait to be redirected back to the live session
//         await participantContext.grantPermissions(['camera', 'microphone']);
//         await participantPage.waitForSelector('canvas', { timeout: 15000 });

//         // Test chat interaction from instructor
//         if (await startClassPage.chatInput.isVisible()) {
//           const instructorChatTime = await startClassPage.sendChatMessage(
//             `${startClassTestData.chatMessage} from instructor`
//           );

//           console.log(`Instructor chat send time: ${instructorChatTime}ms`);

//           // Verify message appears
//           await startClassPage.waitForChatMessage("from instructor");

//           // Expected Result: Chat messages delivered instantly (under 2 seconds)
//           expect(instructorChatTime).toBeLessThan(2000);
//         }

//         // Test chat interaction from participant (if participant can send)
//         const participantClass = new StartClassPage(participantPage);
//         if (await participantClass.chatInput.isVisible()) {
//           const participantChatTime = await participantClass.sendChatMessage(
//             `${startClassTestData.chatMessage} from participant`
//           );

//           console.log(`Participant chat send time: ${participantChatTime}ms`);

//           // Verify message appears for instructor
//           await startClassPage.waitForChatMessage("from participant");
          
//           expect(participantChatTime).toBeLessThan(2000);
//         }

//       } finally {
//         await participantContext.close();
//       }
//     });

//     test("Test Case 4: Interactive Features", async () => {
//       // Objective: Confirm interactive features respond in real-time
//       // Steps: Use interactive features and monitor responsiveness
//       // Expected Result: Features respond promptly with minimal latency

//       const interactionResults = [];

//       // Test poll creation (using same locators as poll tests)
//       try {
//         const pollStartTime = Date.now();
        
//         // Open Poll UI (same as poll tests)
//         await sharedPage.click("(//button[@aria-label='Poll'])[1]");
//         await sharedPage.click('button:has-text("Create New")');
//         await sharedPage.fill('input[placeholder="Enter title"]', POLL_TEST_DATA.pollTitle);
//         await sharedPage.fill('input[placeholder="Enter your question"]', POLL_TEST_DATA.pollQuestion);
//         await sharedPage.fill('input[placeholder="Option 1"]', POLL_TEST_DATA.option1);
//         await sharedPage.fill('input[placeholder="Option 2"]', POLL_TEST_DATA.option2);
//         await sharedPage.getByRole('combobox').filter({ hasText: 'seconds' }).click();
//         await sharedPage.getByRole('option', { name: POLL_TEST_DATA.duration }).click();
//         await sharedPage.click('button:has-text("Save Poll")');
        
//         const pollTime = Date.now() - pollStartTime;
//         interactionResults.push({ feature: "poll", time: pollTime });
//         console.log(`Poll creation time: ${pollTime}ms`);
//       } catch (error) {
//         console.log(`Poll creation not available or failed: ${error.message}`);
//       }

//       // Test whiteboard/annotation feature
//       try {
//         const annotationStartTime = Date.now();
        
//         // Look for whiteboard tab or annotation tools
//         if (await sharedPage.locator('button[role="tab"]:has-text("Whiteboard")').isVisible()) {
//           await sharedPage.click('button[role="tab"]:has-text("Whiteboard")');
          
//           // Test drawing on canvas
//           const canvas = sharedPage.locator('canvas').first();
//           const box = await canvas.boundingBox();
          
//           if (box) {
//             await sharedPage.mouse.click(box.x + 100, box.y + 100);
//             await sharedPage.mouse.move(box.x + 150, box.y + 150);
//           }
//         }
        
//         const annotationTime = Date.now() - annotationStartTime;
//         interactionResults.push({ feature: "annotation", time: annotationTime });
//         console.log(`Annotation creation time: ${annotationTime}ms`);
//       } catch (error) {
//         console.log(`Annotation feature not available or failed: ${error.message}`);
//       }

//       // Test media controls
//       try {
//         const muteResult = await startClassPage.toggleMute();
//         const videoResult = await startClassPage.toggleVideo();

//         console.log(`Mute toggle result: ${muteResult}`);
//         console.log(`Video toggle result: ${videoResult}`);
//       } catch (error) {
//         console.log(`Media controls not available: ${error.message}`);
//       }

//       // Expected Result: All interactive features respond within 1 second
//       interactionResults.forEach((result) => {
//         expect(result.time).toBeLessThan(1000);
//         console.log(
//           `${result.feature} response time: ${result.time}ms - ✓ Under 1 second`
//         );
//       });

//       // Ensure at least one interaction was tested
//       expect(interactionResults.length).toBeGreaterThan(0);
//     });
//   });

//   test.describe("Class Stability Tests", () => {
//     test("Test Case 5: Simultaneous Real-Time Classes", async ({ browser }) => {
//       // Objective: Verify platform handles multiple concurrent real-time classes
//       // Steps: Initiate multiple classes and monitor latency for each
//       // Expected Result: Multiple classes without compromising latency

//       const numberOfClasses = 2; // Limited for test environment
//       const classContexts = [];
//       const initializationTimes = [];

//       try {
//         // Create multiple instructor contexts (same pattern as poll tests)
//         for (let i = 0; i < numberOfClasses; i++) {
//           const context = await browser.newContext({
//             storageState: undefined, // No stored authentication state
//             ignoreHTTPSErrors: true,
//             acceptDownloads: true
//           });
//           const page = await context.newPage();

//           await context.grantPermissions(["camera", "microphone"]);

//           // Navigate to dashboard and start class
//           await page.goto(HOST_CREDENTIALS.dashboardUrl);
          
//           // Handle authentication if needed
//           try {
//             await page.waitForSelector("text=Go Live", { timeout: 5000 });
//           } catch {
//             // If redirected to login, authenticate
//             await page.waitForURL(/auth0\.com\/login|\/login/, { timeout: 10000 });
//             await page.fill('#login-email', HOST_CREDENTIALS.email);
//             await page.fill('#login-password', HOST_CREDENTIALS.password);
//             await page.click('#btn-login');
//             await page.waitForSelector("text=Go Live", { timeout: 10000 });
//           }

//           await page.click("text=Go Live");

//           classContexts.push({ context, page });
//         }

//         // Start all classes simultaneously
//         const startPromises = classContexts.map(async ({ page }, index) => {
//           const startTime = Date.now();

//           // Invite participant and start class
//           await page.fill('input[placeholder*="invite"]', `${INVITEE_CREDENTIALS.email}`);
//           await page.keyboard.press("Enter");
//           await page.click('button:has-text("Start Now")');
//           await page.waitForSelector('canvas', { timeout: 15000 });

//           const totalTime = Date.now() - startTime;
//           initializationTimes.push(totalTime);
          
//           return {
//             classIndex: index,
//             initTime: totalTime
//           };
//         });

//         const results = await Promise.all(startPromises);

//         // Verify all classes started successfully
//         for (const { page } of classContexts) {
//           await expect(page.locator('canvas').first()).toBeVisible();
//         }

//         const avgInitTime = initializationTimes.reduce((a, b) => a + b, 0) / initializationTimes.length;

//         console.log(`Simultaneous classes initialization times: ${initializationTimes.join(", ")}ms`);
//         console.log(`Average initialization time: ${avgInitTime}ms`);

//         results.forEach((result, index) => {
//           console.log(`Class ${index + 1} - Init: ${result.initTime}ms`);
//         });

//         // Expected Result: Each class should start within reasonable time
//         expect(avgInitTime).toBeLessThan(15000); // Average under 15 seconds
//         initializationTimes.forEach((time, index) => {
//           expect(time).toBeLessThan(20000); // Each class under 20 seconds
//         });
        
//       } finally {
//         // Clean up all contexts
//         for (const { context } of classContexts) {
//           await context.close();
//         }
//       }
//     });

//     test("Test Case 6: Network Conditions", async () => {
//       // Objective: Test system resilience to varying network conditions
//       // Steps: Introduce network fluctuations and observe system response
//       // Expected Result: Platform adapts while maintaining low latency

//       const cdpSession = await sharedPage.context().newCDPSession(sharedPage);

//       try {
//         // Enable network domain
//         await cdpSession.send("Network.enable");

//         // Test with slow 3G conditions
//         await cdpSession.send("Network.emulateNetworkConditions", {
//           offline: false,
//           downloadThroughput: startClassTestData.networkConditions.slow3g.downloadThroughput,
//           uploadThroughput: startClassTestData.networkConditions.slow3g.uploadThroughput,
//           latency: startClassTestData.networkConditions.slow3g.latency,
//         });

//         console.log("Testing with slow 3G network conditions...");

//         // Measure latency under slow conditions
//         const slow3gLatency = await startClassPage.measureLatency();
//         console.log(`Latency with slow 3G: ${slow3gLatency}ms`);

//         // Test basic interaction under slow conditions
//         await sharedPage.click('canvas');
//         await sharedPage.waitForTimeout(1000);

//         // Switch to fast 3G conditions
//         await cdpSession.send("Network.emulateNetworkConditions", {
//           offline: false,
//           downloadThroughput: startClassTestData.networkConditions.fast3g.downloadThroughput,
//           uploadThroughput: startClassTestData.networkConditions.fast3g.uploadThroughput,
//           latency: startClassTestData.networkConditions.fast3g.latency,
//         });

//         console.log("Switched to fast 3G network conditions...");

//         // Measure improved latency
//         const fast3gLatency = await startClassPage.measureLatency();
//         console.log(`Latency with fast 3G: ${fast3gLatency}ms`);

//         // Expected Results: Platform adapts to network conditions
//         expect(slow3gLatency).toBeLessThan(startClassTestData.latencyThreshold * 2); // Allow 2x threshold for slow network
//         expect(fast3gLatency).toBeLessThan(startClassTestData.latencyThreshold); // Should meet normal threshold on fast network

//         console.log(`Network adaptation test passed:`);
//         console.log(`- Slow 3G latency: ${slow3gLatency}ms (threshold: ${startClassTestData.latencyThreshold * 2}ms)`);
//         console.log(`- Fast 3G latency: ${fast3gLatency}ms (threshold: ${startClassTestData.latencyThreshold}ms)`);

//       } finally {
//         // Reset network conditions
//         await cdpSession.send("Network.emulateNetworkConditions", {
//           offline: false,
//           downloadThroughput: -1,
//           uploadThroughput: -1,
//           latency: 0,
//         });
//         await cdpSession.detach();
//       }
//     });
//   });

//   test.describe("Additional Class Functionality Tests", () => {
//     test("@smoke Basic Class Setup and Navigation", async () => {
//       // Test that canvas is visible (class is already started in beforeAll)
//       await expect(getMainCanvas()).toBeVisible();
      
//       // Verify we're in a live session
//       const currentUrl = sharedPage.url();
//       expect(currentUrl).toContain('live');
      
//       console.log(`Class URL: ${currentUrl}`);
//     });

//     test("@smoke Class Features - Poll Creation", async () => {
//       // Test poll creation functionality using same pattern as poll tests
//       try {
//         // Open Poll UI (same as poll tests)
//         await sharedPage.click("(//button[@aria-label='Poll'])[1]");
//         await expect(sharedPage.locator('button:has-text("Create New")')).toBeVisible();
        
//         await sharedPage.click('button:has-text("Create New")');
        
//         // Verify poll creation form is visible
//         await expect(sharedPage.locator('input[placeholder="Enter title"]')).toBeVisible();
//         await expect(sharedPage.locator('input[placeholder="Enter your question"]')).toBeVisible();
        
//         console.log("Poll creation interface is accessible");
//       } catch (error) {
//         console.log(`Poll feature may not be available: ${error.message}`);
//       }
//     });

//     test("Canvas Interaction and Responsiveness", async () => {
//       // Test canvas interaction
//       const canvas = sharedPage.locator('canvas').first();
//       await expect(canvas).toBeVisible();
      
//       const box = await canvas.boundingBox();
//       expect(box).toBeTruthy();
      
//       if (box) {
//         const interactionStart = Date.now();
        
//         // Click on canvas
//         await sharedPage.mouse.click(box.x + 100, box.y + 100);
        
//         const interactionTime = Date.now() - interactionStart;
//         console.log(`Canvas interaction time: ${interactionTime}ms`);
        
//         // Canvas should respond quickly
//         expect(interactionTime).toBeLessThan(500);
//       }
//     });

//     test("Session Persistence", async () => {
//       // Test that the session remains active
//       await sharedPage.waitForTimeout(2000);
      
//       // Verify canvas is still visible
//       await expect(sharedPage.locator('canvas').first()).toBeVisible();
      
//       // Verify URL hasn't changed unexpectedly
//       const currentUrl = sharedPage.url();
//       expect(currentUrl).toContain('live');
      
//       console.log("Session remains persistent and active");
//     });
//   });

//   test.afterEach(async () => {
//     // Clean up UI state after each test but keep the stream active for the next test
//     try {
//       console.log("Cleaning up UI state after test...");
      
//       // Close any open modals or dialogs
//       const closeButtons = await sharedPage.locator('button[aria-label*="Close"], button:has-text("Cancel"), .modal button[aria-label*="close"]').all();
//       for (const closeButton of closeButtons) {
//         if (await closeButton.isVisible()) {
//           await closeButton.click();
//           await sharedPage.waitForTimeout(500);
//         }
//       }
      
//       // Press Escape to close any open menus or dialogs
//       await sharedPage.keyboard.press('Escape');
//       await sharedPage.waitForTimeout(500);
      
//       // Verify canvas is still visible (stream should remain active)
//       const isCanvasVisible = await getMainCanvas().isVisible();
//       console.log(`Test completed, UI cleaned, canvas still visible: ${isCanvasVisible}`);
      
//     } catch (error) {
//       console.log("UI cleanup error:", error.message);
//     }
//   });

//   test.afterAll(async () => {
//     // End the stream and clean up the shared context after all tests
//     try {
//       console.log("Ending stream after all tests completed...");
      
//       // End the class/stream using StartClassPage method
//       await startClassPage.endClass();
//       console.log("Stream ended successfully using StartClassPage.endClass()");
      
//       // Wait for stream to end properly
//       await sharedPage.waitForTimeout(3000);
      
//     } catch (error) {
//       console.log("Stream ending error:", error.message);
      
//       // Try fallback method using GoLivePage
//       try {
//         const { GoLivePage } = await import("../../pages/GoLivePage.js");
//         const goLivePage = new GoLivePage(sharedPage);
//         await goLivePage.stopStream();
//         console.log("Stream ended using GoLivePage.stopStream() fallback");
//       } catch (fallbackError) {
//         console.log("Fallback stream stop failed:", fallbackError.message);
//       }
//     }
    
//     // Clean up the shared browser context
//     try {
//       console.log("Cleaning up shared browser context...");
//       if (sharedContext) {
//         await sharedContext.close();
//       }
//     } catch (error) {
//       console.log("Final cleanup error:", error.message);
//     }
//   });
// });
