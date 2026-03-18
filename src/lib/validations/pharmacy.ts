import { z } from 'zod'

export const pharmacyOnboardingSchema = z.object({
  name: z.string().min(2, 'Pharmacy name is required'),
  npi: z.string().length(10, 'NPI must be exactly 10 digits').regex(/^\d+$/, 'NPI must contain only digits'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'Use 2-letter state code'),
  zip: z.string().min(5, 'Valid ZIP code required').max(10),
  pharmacy_type: z.enum([
    'retail', 'specialty', 'ltc', 'compounding', '340b',
    'mail_order', 'hospital_outpatient', 'physician_office',
  ]),
  pms_system: z.enum([
    'primerx', 'pioneerrx', 'qs1', 'liberty', 'bestrx',
    'rx30', 'datascan', 'computer_rx', 'other',
  ]),
})

export type PharmacyOnboardingData = z.infer<typeof pharmacyOnboardingSchema>

export const PHARMACY_TYPES = [
  { value: 'retail', label: 'Retail Pharmacy' },
  { value: 'specialty', label: 'Specialty Pharmacy' },
  { value: 'ltc', label: 'Long-Term Care' },
  { value: 'compounding', label: 'Compounding Pharmacy' },
  { value: '340b', label: '340B Pharmacy' },
  { value: 'mail_order', label: 'Mail Order' },
  { value: 'hospital_outpatient', label: 'Hospital Outpatient' },
  { value: 'physician_office', label: 'Physician Office' },
] as const

export const PMS_SYSTEMS = [
  { value: 'primerx', label: 'PrimeRx' },
  { value: 'pioneerrx', label: 'PioneerRx' },
  { value: 'qs1', label: 'QS/1' },
  { value: 'liberty', label: 'Liberty' },
  { value: 'bestrx', label: 'BestRx' },
  { value: 'rx30', label: 'Rx30' },
  { value: 'datascan', label: 'DataScan' },
  { value: 'computer_rx', label: 'Computer-Rx' },
  { value: 'other', label: 'Other' },
] as const
