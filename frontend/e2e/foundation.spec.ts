import { test, expect } from "@playwright/test"

// MTI 1: shadcn/ui instalado — Button renderiza en el Dashboard
test("shadcn Button renders on dashboard", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "+ Add Job Offer" })).toBeVisible()
})

// MTI 2: Root layout — header con logo "Escribe" visible en todas las rutas
test("header shows Escribe logo on dashboard", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("link", { name: "Escribe" })).toBeVisible()
})

test("header shows Escribe logo on experience library", async ({ page }) => {
  await page.goto("/experience")
  await expect(page.getByRole("link", { name: "Escribe" })).toBeVisible()
})

// MTI 3: Nav + route stubs — links funcionan y cada ruta muestra su título
test("nav link Dashboard navigates to /", async ({ page }) => {
  await page.goto("/experience")
  await page.getByRole("link", { name: "Dashboard" }).click()
  await expect(page).toHaveURL("/")
  await expect(page.getByRole("heading", { name: "Job Offers" })).toBeVisible()
})

test("nav link Experience Library navigates to /experience", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "Experience Library" }).click()
  await expect(page).toHaveURL("/experience")
  await expect(page.getByRole("heading", { name: "Experience Library" })).toBeVisible()
})

test("route /jobs/new renders title", async ({ page }) => {
  await page.goto("/jobs/new")
  await expect(page.getByRole("heading", { name: "Add Job Offer" })).toBeVisible()
})

test("route /jobs/[jobId]/themes renders title", async ({ page }) => {
  await page.goto("/jobs/test-job/themes")
  await expect(page.getByRole("heading", { name: "Key Interview Themes" })).toBeVisible()
})

test("route /jobs/[jobId]/themes/[themeId] renders title", async ({ page }) => {
  await page.goto("/jobs/test-job/themes/test-theme")
  await expect(page.getByRole("heading", { name: "Relevant Experience" })).toBeVisible()
})

test("route /jobs/[jobId]/cover-letter renders title", async ({ page }) => {
  await page.goto("/jobs/test-job/cover-letter")
  await expect(page.getByRole("heading", { name: "Cover Letter" })).toBeVisible()
})

test("route /jobs/[jobId]/cv renders title", async ({ page }) => {
  await page.route('**/api/jobs/test-job/cv', (route) => route.fulfill({ status: 404, body: '' }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))
  await page.goto("/jobs/test-job/cv")
  await expect(page.getByRole("heading", { name: "Tailored CV" })).toBeVisible()
})

test("route /experience/[experienceId] renders title", async ({ page }) => {
  await page.goto("/experience/test-experience")
  await expect(page.getByRole("heading", { name: "Relevant Experience" })).toBeVisible()
})
