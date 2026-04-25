import { test, expect } from '@playwright/test'

// Phase 7 MTI: Frontend services call the backend API instead of localStorage

const JOB_ID = 'p7-job-1'

const mockJob = {
  id: JOB_ID,
  title: 'Platform Engineer',
  company: 'Escribe Corp',
  description: 'Looking for a platform engineer.',
  status: 'active',
  createdAt: '2026-03-20',
}

const mockThemes = [
  { id: 'p7-theme-1', jobId: JOB_ID, name: 'Cloud Infrastructure', description: 'Design cloud systems.', status: 'todo' },
  { id: 'p7-theme-2', jobId: JOB_ID, name: 'Reliability', description: 'Ensure system uptime.', status: 'done' },
]

test('themes page fetches themes from backend API (client-side)', async ({ page }) => {
  // The layout SSR fetch for jobs runs server-side; themes are fetched client-side.
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: mockThemes }))

  await page.goto(`/jobs/${JOB_ID}/themes`)

  // Themes from the mocked backend are visible
  await expect(page.getByText('Cloud Infrastructure')).toBeVisible({ timeout: 8000 })
  await expect(page.getByText('Reliability')).toBeVisible()
})

test('themes page shows correct statuses from backend', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: mockThemes }))

  await page.goto(`/jobs/${JOB_ID}/themes`)

  await expect(page.getByText('To Do')).toBeVisible({ timeout: 8000 })
  await expect(page.getByText('Done')).toBeVisible()
})

test('creating a job POSTs to backend and navigates to themes page', async ({ page }) => {
  const newJobId = 'p7-new-job'

  await page.route('**/api/jobs', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: [] })
    }
    return route.fulfill({
      json: {
        id: newJobId,
        title: 'Platform Engineer',
        company: 'NewCo',
        description: 'Looking for a platform engineer.',
        status: 'active',
        createdAt: '2026-03-20',
        themes: [
          { id: 'new-theme-1', jobId: newJobId, name: 'DevOps', description: 'CI/CD pipelines.', status: 'todo' },
        ],
      },
    })
  })
  await page.route(`**/api/jobs/${newJobId}/themes`, (route) =>
    route.fulfill({
      json: [{ id: 'new-theme-1', jobId: newJobId, name: 'DevOps', description: 'CI/CD pipelines.', status: 'todo' }],
    })
  )

  await page.goto('/jobs/new')
  await page.getByPlaceholder('Paste or type a job offer here').fill('Platform Engineer at NewCo')
  await page.getByRole('button', { name: /add job offer/i }).click()

  await expect(page).toHaveURL(`/jobs/${newJobId}/themes`, { timeout: 10000 })
  await expect(page.getByRole('heading', { name: 'Key Interview Themes' })).toBeVisible()
})

test('add job button shows spinner while backend is processing', async ({ page }) => {
  let resolveRoute!: () => void
  const pendingRoute = new Promise<void>((res) => { resolveRoute = res })

  await page.route('**/api/jobs', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: [] })
    }
    // Hold the POST response until we've checked the spinner
    await pendingRoute
    return route.fulfill({
      json: {
        id: 'spinner-job',
        title: 'Test',
        company: 'Test',
        description: 'test',
        status: 'active',
        createdAt: '2026-03-20',
        themes: [],
      },
    })
  })
  await page.route('**/api/jobs/spinner-job/themes', (route) => route.fulfill({ json: [] }))

  await page.goto('/jobs/new')
  await page.getByPlaceholder('Paste or type a job offer here').fill('Some job description for spinner test')
  await page.getByRole('button', { name: /add job offer/i }).click()

  // Spinner text is visible while loading
  await expect(page.getByText('Analysing...')).toBeVisible()

  resolveRoute()
})

test('tailored CV page renders Writing Assistant', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, (route) => route.fulfill({ status: 404, body: '' }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  await page.goto(`/jobs/${JOB_ID}/cv`)

  await expect(page.getByRole('heading', { name: 'Tailored CV' })).toBeVisible({ timeout: 8000 })
  await expect(page.getByTestId('editor-content')).toBeVisible()
})

test('tailored CV page loads saved content into editor', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, (route) =>
    route.fulfill({
      json: { id: 'cv-1', jobId: JOB_ID, text: 'My tailored CV content here.', updatedAt: '2026-03-20' },
    })
  )
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  await page.goto(`/jobs/${JOB_ID}/cv`)

  const editor = page.getByTestId('editor-content')
  await expect(editor).toContainText('My tailored CV content here.', { timeout: 8000 })
})

test('tailored CV auto-saves and calls backend PUT', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 404, body: '' })
    }
    return route.fulfill({
      json: { id: 'cv-1', jobId: JOB_ID, text: 'Updated text', updatedAt: '2026-03-20' },
    })
  })
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  await page.goto(`/jobs/${JOB_ID}/cv`)

  // Wait for the Writing Assistant to render (after initial CV fetch)
  const editor = page.getByTestId('editor-content')
  await expect(editor).toBeVisible({ timeout: 8000 })

  // Set up the PUT request intercept before typing
  const saveRequest = page.waitForRequest(
    (req) => req.url().includes(`/api/jobs/${JOB_ID}/cv`) && req.method() === 'PUT'
  )

  // Type in the editor — auto-save triggers after 1500ms debounce
  await editor.fill('Updated text')

  const req = await saveRequest
  const body = req.postDataJSON() as { text: string }
  expect(body.text).toBe('Updated text')
})
