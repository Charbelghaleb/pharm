import { z } from 'zod'

export const rejectionSchema = z.object({
  reject_code: z.string().min(1, 'Rejection code is required'),
  pbm_name: z.string().optional(),
  pbm_bin: z.string().optional(),
  pbm_pcn: z.string().optional(),
  drug_ndc: z.string().optional(),
  drug_name: z.string().optional(),
  insurance_type: z.enum([
    'medicare_d', 'medicaid', 'commercial', 'workers_comp', 'cash', 'other',
  ]).default('other'),
  patient_id_hash: z.string().optional(),
  state: z.string().optional(),
})

export type RejectionFormData = z.input<typeof rejectionSchema>

export const resolutionSchema = z.object({
  action_taken: z.string().min(5, 'Please describe the action taken'),
  action_category: z.enum([
    'override_submitted', 'pa_initiated', 'alternative_dispensed',
    'patient_contacted', 'prescriber_contacted', 'insurance_called',
    'billing_corrected', 'other',
  ]),
  override_code_used: z.string().optional(),
  outcome: z.enum([
    'claim_paid', 'claim_denied', 'pa_approved', 'pa_denied',
    'alternative_accepted', 'abandoned',
  ]),
  revenue_recovered: z.coerce.number().min(0).default(0),
  time_to_resolve_minutes: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  is_shared: z.boolean().optional().default(true),
})

export type ResolutionFormData = z.input<typeof resolutionSchema>

export const INSURANCE_TYPES = [
  { value: 'medicare_d', label: 'Medicare Part D' },
  { value: 'medicaid', label: 'Medicaid' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'workers_comp', label: 'Workers Comp' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
] as const

export const ACTION_CATEGORIES = [
  { value: 'override_submitted', label: 'Override Submitted' },
  { value: 'pa_initiated', label: 'Prior Auth Initiated' },
  { value: 'alternative_dispensed', label: 'Alternative Dispensed' },
  { value: 'patient_contacted', label: 'Patient Contacted' },
  { value: 'prescriber_contacted', label: 'Prescriber Contacted' },
  { value: 'insurance_called', label: 'Insurance Called' },
  { value: 'billing_corrected', label: 'Billing Corrected' },
  { value: 'other', label: 'Other' },
] as const

export const OUTCOME_OPTIONS = [
  { value: 'claim_paid', label: 'Claim Paid' },
  { value: 'claim_denied', label: 'Claim Denied' },
  { value: 'pa_approved', label: 'PA Approved' },
  { value: 'pa_denied', label: 'PA Denied' },
  { value: 'alternative_accepted', label: 'Alternative Accepted' },
  { value: 'abandoned', label: 'Abandoned' },
] as const

export const COMMON_PBMS = [
  'Express Scripts',
  'CVS Caremark',
  'OptumRx',
  'Cigna',
  'Humana',
  'MedImpact',
  'Prime Therapeutics',
  'Magellan Rx',
  'Elixir',
  'Navitus',
  'EnvisionRx',
  'Argus',
  'Performant',
  'SS&C',
  'Other',
] as const
