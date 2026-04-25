import { test, expect } from '@playwright/test'

const JOB_ID = 'job-1'
const THEME_ID = 'theme-1-1'
const EXPERIENCE_URL = `**/api/jobs/${JOB_ID}/themes/${THEME_ID}/experience`

test('editor is pre-populated when backend finds a matching experience', async ({ page }) => {
  const matchedText = 'Situation: I was leading a cross-functional initiative...'
  const matchGreeting = 'I found a similar story you wrote for "Stakeholder Management". I\'ve loaded it into the editor — adapt it to fit this role.'

  await page.route(EXPERIENCE_URL, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { text: matchedText, initialGreeting: matchGreeting } })
    }
    return route.continue()
  })

  await page.goto(`/jobs/${JOB_ID}/themes/${THEME_ID}`)

  await expect(page.getByTestId('editor-content')).toContainText(matchedText, { timeout: 8000 })
})

test('chat shows match greeting when a similar experience is found', async ({ page }) => {
  const matchedText = 'Situation: I was leading a cross-functional initiative...'
  const matchGreeting = 'I found a similar story you wrote for "Stakeholder Management". I\'ve loaded it into the editor — adapt it to fit this role.'

  await page.route(EXPERIENCE_URL, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { text: matchedText, initialGreeting: matchGreeting } })
    }
    return route.continue()
  })

  await page.goto(`/jobs/${JOB_ID}/themes/${THEME_ID}`)

  await expect(page.getByText('I found a similar story you wrote for')).toBeVisible({ timeout: 8000 })
  await expect(page.getByText('"Stakeholder Management"')).toBeVisible()
})

test('editor is empty when no matching experience exists', async ({ page }) => {
  const normalGreeting = "Let's build your \"Leadership\" example.\nWrite a rough draft below"

  await page.route(EXPERIENCE_URL, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { text: '', initialGreeting: normalGreeting } })
    }
    return route.continue()
  })

  await page.goto(`/jobs/${JOB_ID}/themes/${THEME_ID}`)

  // Editor is visible with no content (only whitespace/empty paragraphs)
  const editor = page.getByTestId('editor-content')
  await expect(editor).toBeVisible({ timeout: 8000 })
  await expect(editor).toHaveText(/^\s*$/, { timeout: 8000 })
  await expect(page.getByText("Let's build your")).toBeVisible()
})

test('editor shows existing saved content and does not trigger match greeting', async ({ page }) => {
  const existingText = 'My already written story about leading a team through a difficult migration.'
  const normalReturnGreeting = "Hello! I'm your AI writing assistant. How can I help you improve your document today?"

  await page.route(EXPERIENCE_URL, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { text: existingText, initialGreeting: normalReturnGreeting } })
    }
    return route.continue()
  })

  await page.goto(`/jobs/${JOB_ID}/themes/${THEME_ID}`)

  await expect(page.getByTestId('editor-content')).toContainText(existingText, { timeout: 8000 })
  await expect(page.getByText('I found a similar story')).not.toBeVisible()
})
