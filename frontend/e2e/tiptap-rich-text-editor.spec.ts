import { test, expect } from '@playwright/test'

test('tiptap editor is visible and textarea is gone', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  await expect(page.getByTestId('editor-content')).toBeVisible()
  await expect(page.getByTestId('editor-textarea')).not.toBeAttached()
})

test('toolbar buttons are visible', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  await expect(page.getByTitle('Bold')).toBeVisible()
  await expect(page.getByTitle('Italic')).toBeVisible()
  await expect(page.getByTitle('Bullet list')).toBeVisible()
  await expect(page.getByTitle('Ordered list')).toBeVisible()
  await expect(page.getByTitle('Heading')).toBeVisible()
})

test('typing text appears in the editor', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  const editor = page.getByTestId('editor-content')
  await editor.click()
  await page.keyboard.type('Hello world')
  await expect(editor).toContainText('Hello world')
})

test('bold toolbar button toggles active state', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  const boldBtn = page.getByTitle('Bold')

  // Not active initially
  await expect(boldBtn).not.toHaveClass(/bg-stone-100.*text-stone-900|text-stone-900.*bg-stone-100/)

  // Click bold — should become active
  await boldBtn.click()
  await expect(boldBtn).toHaveClass(/bg-stone-100/)
})

test('chat request editorContent contains plain text (no markdown syntax)', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')

  const editor = page.getByTestId('editor-content')
  await editor.click()
  await page.keyboard.type('I led a cross-functional team to deliver a critical migration project on time.')

  const chatRequestPromise = page.waitForRequest((req) =>
    req.url().includes('/api/chat') && req.method() === 'POST'
  )

  const chatInput = page.getByPlaceholder('Ask AI to modify your document...')
  await chatInput.fill('Review this')
  await chatInput.press('Enter')

  const chatRequest = await chatRequestPromise
  const body = chatRequest.postDataJSON() as { editorContent?: string }
  // Plain text — no HTML tags, no markdown symbols wrapping the text
  expect(body.editorContent).toContain('I led a cross-functional team to deliver a critical migration project on time.')
  expect(body.editorContent).not.toContain('<p>')
})
