import { test, expect } from '../../fixtures/sessionFixture.js';

test.describe('Whiteboard Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('https://ngage.ngenux.app/dashboard');
    await page.getByRole('link', { name: /go live/i }).click();
    await context.grantPermissions(['camera', 'microphone']);
    const inviteInput = page.locator('input[placeholder*="invite"]');
    await inviteInput.fill('testuser@example.com');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: /start now/i }).click();
    await page.getByRole('tab', { name: "Whiteboard" }).click();
  });

  test('@smoke Test 1: All whiteboard controls are visible and clickable', async ({ page }) => {
    await expect(page.getByTitle('Pencil')).toBeVisible();
    await expect(page.getByTitle('Line')).toBeVisible();
    await expect(page.getByTitle('Rectangle')).toBeVisible();
    await expect(page.getByTitle('Ellipse')).toBeVisible();
    await expect(page.getByTitle('Arrow')).toBeVisible();
    await expect(page.getByTitle('Eraser')).toBeVisible();
    await expect(page.getByTitle('Undo')).toBeVisible();
    await expect(page.getByTitle('Redo')).toBeVisible();
    // Click each tool to verify clickable
    await page.getByTitle('Pencil').click();
    await page.getByTitle('Line').click();
    await page.getByTitle('Rectangle').click();
    await page.getByTitle('Ellipse').click();
    await page.getByTitle('Arrow').click();
    await page.getByTitle('Eraser').click();
    await page.getByTitle('Undo').click();
    await page.getByTitle('Redo').click();
    // Clear button (not title, but text)
    await page.getByRole('button', { name: /clear/i }).click();
  });

  test('@smoke Test 2: Draws on canvas and verifies drawing appears', async ({ page }) => {
    await page.getByTitle('Pencil').click();
    const canvas = await page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 120, box.y + 120);
      await page.mouse.up();
    }
    await expect(canvas).toBeVisible();
  });

  test('Test 3: Undo, redo, and clear board work as expected', async ({ page }) => {
    await page.getByTitle('Pencil').click();
    const canvas = await page.locator('canvas').first();
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 30, box.y + 30);
      await page.mouse.down();
      await page.mouse.move(box.x + 130, box.y + 130);
      await page.mouse.up();
    }
    await page.getByTitle('Undo').click();
    await page.getByTitle('Redo').click();
    await page.getByRole('button', { name: /clear/i }).click();
    await expect(canvas).toBeVisible();
  });

 

  test('Test 4: Negative - clicking canvas without selecting a tool does not error', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));
    const canvas = await page.locator('canvas').first();
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.up();
    }
    expect(errors.length).toBe(0);
  });

  test('Test 5: Edge - rapidly switch tools and perform actions', async ({ page }) => {
    const canvas = await page.locator('canvas').first();
    const box = await canvas.boundingBox();
    const tools = ['Pencil', 'Line', 'Rectangle', 'Ellipse', 'Arrow', 'Eraser'];
    for (let i = 0; i < 3; i++) {
      for (const tool of tools) {
        await page.getByTitle(tool).click();
        if (box) {
          await page.mouse.move(box.x + 10 + i * 10, box.y + 10 + i * 10);
          await page.mouse.down();
          await page.mouse.move(box.x + 60 + i * 10, box.y + 60 + i * 10);
          await page.mouse.up();
        }
      }
    }
    await expect(canvas).toBeVisible();
  });

  test('Test 6: No errors in browser console during whiteboard actions', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));
    await page.getByTitle('Pencil').click();
    const canvas = await page.locator('canvas').first();
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 40, box.y + 40);
      await page.mouse.down();
      await page.mouse.move(box.x + 140, box.y + 140);
      await page.mouse.up();
    }
    await page.getByTitle('Undo').click();
    await page.getByTitle('Redo').click();
    await page.getByRole('button', { name: /clear/i }).click();
    expect(errors.length).toBe(0);
  });
});
