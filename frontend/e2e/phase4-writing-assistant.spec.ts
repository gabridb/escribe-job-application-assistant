import { test, expect } from '@playwright/test'

test('writing assistant renders split-screen layout', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  // chat panel
  await expect(page.getByPlaceholder('Ask AI to modify your document...')).toBeVisible()
  // editor panel
  await expect(page.getByPlaceholder('Start writing here...')).toBeVisible()
})

test('editor textarea accepts text input', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  const editor = page.getByPlaceholder('Start writing here...')
  await editor.fill('My relevant experience story')
  await expect(editor).toHaveValue('My relevant experience story')
})

test('chat sends user message and receives AI reply', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  const chatInput = page.getByPlaceholder('Ask AI to modify your document...')
  await chatInput.fill('Can you help me improve this?')
  await chatInput.press('Enter')
  // User message appears immediately
  await expect(page.getByText('Can you help me improve this?')).toBeVisible()
  // Wait for the AI to respond (input re-enabled once loading completes)
  await expect(chatInput).toBeEnabled({ timeout: 15000 })
  // Loading indicator is gone — a real response was received
  await expect(page.getByText('Thinking…')).not.toBeVisible()
})

test('review my draft button hidden until editor has 10+ words', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  const reviewButton = page.getByRole('button', { name: 'Review my draft' })

  // Not visible with empty editor
  await expect(reviewButton).not.toBeVisible()

  // Not visible with fewer than 10 words
  await page.getByPlaceholder('Start writing here...').fill('Only a few words here.')
  await expect(reviewButton).not.toBeVisible()

  // Visible once editor reaches 10+ words
  await page.getByPlaceholder('Start writing here...').fill(
    'I led a cross-functional team to deliver a critical migration project on time.'
  )
  await expect(reviewButton).toBeVisible()
})

test('review my draft button hides after being clicked', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')

  await page.getByPlaceholder('Start writing here...').fill(
    'I led a cross-functional team to deliver a critical migration project on time.'
  )
  const reviewButton = page.getByRole('button', { name: 'Review my draft' })
  await expect(reviewButton).toBeVisible()

  await reviewButton.click()

  // Button hides immediately after clicking
  await expect(reviewButton).not.toBeVisible()
})

test('review my draft button reappears only after 10 more words are added', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')

  const editor = page.getByPlaceholder('Start writing here...')
  const reviewButton = page.getByRole('button', { name: 'Review my draft' })

  // Write exactly 10 words and click review
  await editor.fill('I led a team to successfully deliver a critical project.')
  await expect(reviewButton).toBeVisible()
  await reviewButton.click()
  await expect(reviewButton).not.toBeVisible()

  // Adding fewer than 10 words — button should stay hidden
  await editor.fill('I led a team to deliver a critical project. Also improved.')
  await expect(reviewButton).not.toBeVisible()

  // Adding 10+ more words — button should reappear
  await editor.fill(
    'I led a team to deliver a critical project. I also improved our deployment pipeline reducing release time by forty percent.'
  )
  await expect(reviewButton).toBeVisible()
})

test('review my draft button sends predefined message with editor content', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')

  await page.getByPlaceholder('Start writing here...').fill(
    'I led a cross-functional team to deliver a critical migration project on time.'
  )

  const chatRequestPromise = page.waitForRequest((req) =>
    req.url().includes('/api/chat') && req.method() === 'POST'
  )

  await page.getByRole('button', { name: 'Review my draft' }).click()

  const chatRequest = await chatRequestPromise
  const body = chatRequest.postDataJSON() as { messages: { role: string; content: string }[]; editorContent?: string }

  // Predefined message text is sent
  expect(body.messages.at(-1)).toMatchObject({ role: 'user', content: 'Please review my draft' })
  // Editor content is included in the payload
  expect(body.editorContent).toBe('I led a cross-functional team to deliver a critical migration project on time.')
})

test('chat request includes editor content in payload', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')

  // Write a draft in the editor
  const editor = page.getByPlaceholder('Start writing here...')
  await editor.fill('I led a cross-functional team to deliver a critical migration project on time.')

  // Intercept the chat request before sending
  const chatRequestPromise = page.waitForRequest((req) =>
    req.url().includes('/api/chat') && req.method() === 'POST'
  )

  const chatInput = page.getByPlaceholder('Ask AI to modify your document...')
  await chatInput.fill('Can you review my draft?')
  await chatInput.press('Enter')

  const chatRequest = await chatRequestPromise
  const body = chatRequest.postDataJSON() as { editorContent?: string }
  expect(body.editorContent).toBe('I led a cross-functional team to deliver a critical migration project on time.')
})

test('cover letter page shows Cover Letter label', async ({ page }) => {
  await page.goto('/jobs/job-1/cover-letter')
  await expect(page.getByRole('heading', { name: 'Cover Letter' })).toBeVisible()
})

test('cv page shows Tailored CV label', async ({ page }) => {
  await page.goto('/jobs/job-1/cv')
  await expect(page.getByRole('heading', { name: 'Tailored CV' })).toBeVisible()
})
