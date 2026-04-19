import { NO_FABRICATION_RULE } from './prompt-guardrails'

describe('NO_FABRICATION_RULE', () => {
  it('is a non-empty string', () => {
    expect(typeof NO_FABRICATION_RULE).toBe('string')
    expect(NO_FABRICATION_RULE.length).toBeGreaterThan(0)
  })

  it('includes the "Never invent" clause so downstream prompts keep the guardrail', () => {
    expect(NO_FABRICATION_RULE).toContain('Never invent')
  })
})
