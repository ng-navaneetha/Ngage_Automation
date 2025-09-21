Generate a robust Playwright test using @playwright/test in TypeScript for the following scenario:

Feature: Host a Live Class and interact with Whiteboard

1. Navigate to the URL: `https://example.com/host-live-class`
2. Log in with:
   - Email: 
   - Password:
3. Click on link 'Go Live'
4. Allow Camera and Microphone permissions if prompted
invite user with mail `Email: `
5. Click 'Start Now' to begin the session
6. Open the 'Whiteboard' tool from the meeting sidebar
7. Validate all whiteboard controls:
   - Pen/Brush tool
   - Shapes
   - Color picker
   - Eraser
   - Clear board
   - Undo/Redo
   - Zoom or Pan
8. Try drawing on the canvas (e.g., a line or shape)
9. Verify that:
   - The drawing appears visually
   - Controls are clickable and functional
   - Undo/redo works as expected
   - Clear board removes all drawings
   - No errors occur in console

Test Requirements:
- Use getByRole or getByTestId (avoid fragile selectors)
- Use `expect(...).toBeVisible()` and other assertions to validate presence and behavior
- Split test into `test.describe()` groups and `test()` blocks for each action/assertion
- Save test in `/tests` directory
- Log or assert all key UI behaviors
- Ensure tests are stable, retry if needed, and pass consistently

Also include:
- Negative test: try clicking on canvas without selecting a tool — expect no error
- Edge case: rapidly switch tools and perform actions — validate responsiveness

Output only code, clean and ready to use.
