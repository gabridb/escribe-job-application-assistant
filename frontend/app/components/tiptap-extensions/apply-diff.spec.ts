import { describe, it, expect } from 'vitest'
import { buildDiffHtml } from './apply-diff'

describe('buildDiffHtml', () => {
  it('marks an inserted word with data-diff="insertion"', () => {
    const result = buildDiffHtml('Hello world', 'Hello there world')
    expect(result).not.toBeNull()
    expect(result).toContain('data-diff="insertion"')
    expect(result).toContain('there')
  })

  it('marks a deleted word with data-diff="deletion"', () => {
    const result = buildDiffHtml('Hello world', 'Hello')
    expect(result).not.toBeNull()
    expect(result).toContain('data-diff="deletion"')
    expect(result).toContain('world')
  })

  it('returns null when >80% of words are changed (full rewrite)', () => {
    // 'foo' → 'bar': 1 word changed out of 1 total = 100%
    const result = buildDiffHtml('foo', 'bar')
    expect(result).toBeNull()
  })

  it('preserves unchanged text without marks', () => {
    const result = buildDiffHtml('Hello world', 'Hello there world')
    expect(result).not.toBeNull()
    expect(result).toContain('Hello')
    // The unchanged 'Hello' should not be wrapped in a diff span
    expect(result).not.toMatch(/<span data-diff[^>]*>Hello<\/span>/)
  })
})
