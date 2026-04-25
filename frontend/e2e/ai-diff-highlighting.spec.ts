import { test, expect, type Page } from '@playwright/test'

const ORIGINAL_TEXT = 'I led the migration project and delivered it on time.'
const REVISED_TEXT = 'I led the critical migration project and delivered it ahead of schedule.'

const AI_RESPONSE = `Here is your improved draft.<editor_content>${REVISED_TEXT}</editor_content>`

async function setupPage(page: Page) {
  // Mock chat endpoint to return a response with <editor_content>
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: AI_RESPONSE }),
    }),
  )

  // Navigate to a Writing Assistant route
  await page.goto('/jobs/job-1/themes/theme-1-1')

  // Wait for the editor to be ready
  const editor = page.getByTestId('editor-content')
  await expect(editor).toBeVisible({ timeout: 8000 })

  // Type initial content
  await editor.click()
  await page.keyboard.type(ORIGINAL_TEXT)

  return editor
}

test('AI rewrite shows diff bar with Accept and Reject buttons', async ({ page }) => {
  await setupPage(page)

  const chatInput = page.getByPlaceholder('Ask AI to modify your document...')
  await chatInput.fill('Improve this')
  await chatInput.press('Enter')

  // Wait for AI response and diff bar to appear
  await expect(page.getByTestId('diff-bar')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('accept-button')).toBeVisible()
  await expect(page.getByTestId('reject-button')).toBeVisible()

  // Diff marks should be visible in the editor
  const editor = page.getByTestId('editor-content')
  await expect(editor.locator('[data-diff="insertion"]').first()).toBeVisible()
})

test('clicking Accept applies AI content and hides diff bar', async ({ page }) => {
  await setupPage(page)

  const chatInput = page.getByPlaceholder('Ask AI to modify your document...')
  await chatInput.fill('Improve this')
  await chatInput.press('Enter')

  await expect(page.getByTestId('diff-bar')).toBeVisible({ timeout: 15000 })

  await page.getByTestId('accept-button').click()

  // Diff bar should be gone
  await expect(page.getByTestId('diff-bar')).not.toBeVisible()

  // Editor should contain the AI content (no diff marks)
  const editor = page.getByTestId('editor-content')
  await expect(editor.locator('[data-diff]')).toHaveCount(0)
  await expect(editor).toContainText('ahead of schedule')
})

test('clicking Reject restores original content and hides diff bar', async ({ page }) => {
  await setupPage(page)

  const chatInput = page.getByPlaceholder('Ask AI to modify your document...')
  await chatInput.fill('Improve this')
  await chatInput.press('Enter')

  await expect(page.getByTestId('diff-bar')).toBeVisible({ timeout: 15000 })

  await page.getByTestId('reject-button').click()

  // Diff bar should be gone
  await expect(page.getByTestId('diff-bar')).not.toBeVisible()

  // Editor should contain original content (no diff marks)
  const editor = page.getByTestId('editor-content')
  await expect(editor.locator('[data-diff]')).toHaveCount(0)
  await expect(editor).toContainText(ORIGINAL_TEXT)
})

test('Send button is disabled while diff is pending', async ({ page }) => {
  await setupPage(page)

  const chatInput = page.getByPlaceholder('Ask AI to modify your document...')
  await chatInput.fill('Improve this')
  await chatInput.press('Enter')

  await expect(page.getByTestId('diff-bar')).toBeVisible({ timeout: 15000 })

  // Send button should be disabled during diff mode
  const sendButton = page.getByRole('button', { name: 'Send' })
  await expect(sendButton).toBeDisabled()
})

test('AI full-rewrite (>80% changed) shows proposed content in editor with Accept/Reject', async ({ page }) => {
  const FULL_REWRITE_ORIGINAL = 'I did the project.'
  const FULL_REWRITE_REVISED =
    'When our legacy billing system began failing nightly, I proposed, designed, and led a cross-team migration to a new event-driven architecture that eliminated the outages and unlocked subscription billing.'

  await page.route('**/api/chat', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: `Here is a full rewrite.<editor_content>${FULL_REWRITE_REVISED}</editor_content>`,
      }),
    }),
  )

  await page.goto('/jobs/job-1/themes/theme-1-1')

  const editor = page.getByTestId('editor-content')
  await expect(editor).toBeVisible({ timeout: 8000 })
  await editor.click()
  await page.keyboard.type(FULL_REWRITE_ORIGINAL)

  const chatInput = page.getByPlaceholder('Ask AI to modify your document...')
  await chatInput.fill('rewrite from scratch')
  await chatInput.press('Enter')

  await expect(page.getByTestId('diff-bar')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('diff-bar')).toContainText('Full document replaced')

  // The proposed rewrite must be visible in the editor while diff is pending
  await expect(editor).toContainText('event-driven architecture')
  // No inline insertion/deletion marks in the full-rewrite path
  await expect(editor.locator('[data-diff]')).toHaveCount(0)

  // Reject restores the original
  await page.getByTestId('reject-button').click()
  await expect(page.getByTestId('diff-bar')).not.toBeVisible()
  await expect(editor).toContainText(FULL_REWRITE_ORIGINAL)
  await expect(editor).not.toContainText('event-driven architecture')
})
