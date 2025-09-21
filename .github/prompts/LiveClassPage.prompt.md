Generate a robust Playwright test using @playwright/test in TypeScript for the "Live Class" feature.

Steps:
1. Navigate to https://ngage.ngenux.app/dashboard
2. Login with:
   - Email: --------
   - Password: --------
3. Click "Go Live" and allow mic/camera permissions
4. After session starts, test functionality of each key control:

✅ Mic Button
- Click mic button to mute
- Assert mic icon/state changes (e.g. icon toggles or class updates)
- Click again to unmute
- Assert mic is re-enabled

✅ Camera Button
- Toggle camera off
- Assert video stream disappears or indicator changes
- Toggle camera on
- Assert video stream is visible again

✅ Chat Panel
- Open chat sidebar
- Type and send a message
- Assert the message appears in chat history
- Close the chat and reopen — message should persist

✅ Participants Panel
- Open sidebar and assert participant count increases when someone joins

✅ Screen Share
- Click screen share
- Assert screen share prompt appears or UI reflects screen sharing active

✅ Invite Modal
- Click Invite
- Assert modal opens and fields/buttons are interactable

Technical Notes:
- Use functional assertions, not just `.toBeVisible()` or `.toBeEnabled()`
- Assert UI changes **before and after interaction**
- Use `getByRole` or `getByTestId`, not regex selectors
- Structure with `test.describe()` and separate `test()` blocks
- Save under `/tests` directory
- Also include:
- Negative test: try clicking on canvas without selecting a tool — expect no error
- Edge case: rapidly switch tools and perform actions — validate responsiveness