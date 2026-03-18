export type PharmacyType =
  | 'retail' | 'specialty' | 'ltc' | 'compounding' | '340b'
  | 'mail_order' | 'hospital_outpatient' | 'physician_office'

export type PmsSystem =
  | 'primerx' | 'pioneerrx' | 'qs1' | 'liberty' | 'bestrx'
  | 'rx30' | 'datascan' | 'computer_rx' | 'other'

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise'

export type UserRole = 'owner' | 'pharmacist' | 'technician' | 'admin'

export type RejectCategory =
  | 'eligibility' | 'data_validation' | 'prior_auth' | 'dur_clinical'
  | 'refill_policy' | 'coverage' | 'other'

export type InsuranceType =
  | 'medicare_d' | 'medicaid' | 'commercial' | 'workers_comp' | 'cash' | 'other'

export type RejectionStatus =
  | 'open' | 'in_progress' | 'resolved' | 'escalated' | 'abandoned'

export type ActionCategory =
  | 'override_submitted' | 'pa_initiated' | 'alternative_dispensed'
  | 'patient_contacted' | 'prescriber_contacted' | 'insurance_called'
  | 'billing_corrected' | 'other'

export type ResolutionOutcome =
  | 'claim_paid' | 'claim_denied' | 'pa_approved' | 'pa_denied'
  | 'alternative_accepted' | 'abandoned'

export type VoteType = 'helpful' | 'not_helpful'

export interface Pharmacy {
  id: string
  name: string
  npi: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  phone: string | null
  pharmacy_type: PharmacyType
  pms_system: PmsSystem
  subscription_tier: SubscriptionTier
  onboarded_at: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  pharmacy_id: string | null
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NcpdpRejectCode {
  id: number
  code: string
  short_description: string
  plain_english: string
  category: RejectCategory
  common_causes: string[]
  general_resolution_steps: string[]
  created_at: string
}

export interface Rejection {
  id: string
  pharmacy_id: string
  user_id: string
  reject_code: string
  pbm_name: string | null
  pbm_bin: string | null
  pbm_pcn: string | null
  drug_ndc: string | null
  drug_name: string | null
  insurance_type: InsuranceType
  patient_id_hash: string | null
  state: string | null
  rejection_timestamp: string
  status: RejectionStatus
  created_at: string
  updated_at: string
}

export interface RejectionResolution {
  id: string
  rejection_id: string
  pharmacy_id: string
  user_id: string
  action_taken: string
  action_category: ActionCategory
  override_code_used: string | null
  outcome: ResolutionOutcome | null
  revenue_recovered: number
  time_to_resolve_minutes: number | null
  notes: string | null
  is_shared: boolean
  created_at: string
  resolved_at: string | null
}

export interface ResolutionVote {
  id: string
  resolution_id: string
  user_id: string
  vote: VoteType
  created_at: string
}

// Extended types with joins
export interface RejectionWithCode extends Rejection {
  ncpdp_reject_codes: NcpdpRejectCode
}

export interface RejectionWithResolutions extends Rejection {
  ncpdp_reject_codes: NcpdpRejectCode
  rejection_resolutions: RejectionResolution[]
}

export interface ResolutionWithVotes extends RejectionResolution {
  resolution_votes: ResolutionVote[]
  helpful_count?: number
  not_helpful_count?: number
}

export type Database = {
  public: {
    Tables: {
      pharmacies: {
        Row: Pharmacy
        Insert: Omit<Pharmacy, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Pharmacy, 'id' | 'created_at'>>
      }
      users: {
        Row: User
        Insert: Omit<User, 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      ncpdp_reject_codes: {
        Row: NcpdpRejectCode
        Insert: Omit<NcpdpRejectCode, 'id' | 'created_at'>
        Update: Partial<Omit<NcpdpRejectCode, 'id' | 'created_at'>>
      }
      rejections: {
        Row: Rejection
        Insert: Omit<Rejection, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Rejection, 'id' | 'created_at'>>
      }
      rejection_resolutions: {
        Row: RejectionResolution
        Insert: Omit<RejectionResolution, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<RejectionResolution, 'id' | 'created_at'>>
      }
      resolution_votes: {
        Row: ResolutionVote
        Insert: Omit<ResolutionVote, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<ResolutionVote, 'id' | 'created_at'>>
      }
    }
  }
}
