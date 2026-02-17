import { describe, it, expect } from '@jest/globals'
import {
  OrganisationSchema,
  OrganisationsResponseSchema,
} from '@/schemas/organisation.schema'

describe('Organisation Schemas', () => {
  const validOrganisation = {
    organisationUniqueKey: 'cd4a4dcf-c99d-4f18-81c8-aa6b2adbbe22',
    name: 'Queensland Basketball',
  }

  describe('OrganisationSchema', () => {
    it('accepts a valid organisation', () => {
      const result = OrganisationSchema.safeParse(validOrganisation)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.organisationUniqueKey).toBe('cd4a4dcf-c99d-4f18-81c8-aa6b2adbbe22')
        expect(result.data.name).toBe('Queensland Basketball')
      }
    })

    it('passes through unknown fields', () => {
      const data = {
        ...validOrganisation,
        city: 'Brisbane',
        state: 'QLD',
      }
      const result = OrganisationSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).city).toBe('Brisbane')
      }
    })

    it('rejects missing organisationUniqueKey', () => {
      const result = OrganisationSchema.safeParse({ name: 'Test' })
      expect(result.success).toBe(false)
    })

    it('rejects missing name', () => {
      const result = OrganisationSchema.safeParse({
        organisationUniqueKey: 'cd4a4dcf-c99d-4f18-81c8-aa6b2adbbe22',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid GUID for organisationUniqueKey', () => {
      const result = OrganisationSchema.safeParse({
        organisationUniqueKey: 'not-a-guid',
        name: 'Test',
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
      const result = OrganisationSchema.safeParse({
        organisationUniqueKey: 'cd4a4dcf-c99d-4f18-81c8-aa6b2adbbe22',
        name: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('OrganisationsResponseSchema', () => {
    it('accepts an array of organisations', () => {
      const data = [
        validOrganisation,
        {
          organisationUniqueKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'Basketball Australia',
        },
      ]
      const result = OrganisationsResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('accepts an empty array', () => {
      const result = OrganisationsResponseSchema.safeParse([])
      expect(result.success).toBe(true)
    })

    it('rejects array with invalid organisation', () => {
      const data = [{ name: 'Missing key' }]
      const result = OrganisationsResponseSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
