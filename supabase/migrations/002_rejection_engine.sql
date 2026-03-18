-- Rejection Intelligence Engine Schema

-- Enums
CREATE TYPE reject_category AS ENUM (
  'eligibility', 'data_validation', 'prior_auth', 'dur_clinical',
  'refill_policy', 'coverage', 'other'
);

CREATE TYPE insurance_type AS ENUM (
  'medicare_d', 'medicaid', 'commercial', 'workers_comp', 'cash', 'other'
);

CREATE TYPE rejection_status AS ENUM (
  'open', 'in_progress', 'resolved', 'escalated', 'abandoned'
);

CREATE TYPE action_category AS ENUM (
  'override_submitted', 'pa_initiated', 'alternative_dispensed',
  'patient_contacted', 'prescriber_contacted', 'insurance_called',
  'billing_corrected', 'other'
);

CREATE TYPE resolution_outcome AS ENUM (
  'claim_paid', 'claim_denied', 'pa_approved', 'pa_denied',
  'alternative_accepted', 'abandoned'
);

CREATE TYPE vote_type AS ENUM ('helpful', 'not_helpful');

-- NCPDP Rejection Codes reference table
CREATE TABLE ncpdp_reject_codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  plain_english TEXT NOT NULL,
  category reject_category DEFAULT 'other',
  common_causes TEXT[] DEFAULT '{}',
  general_resolution_steps TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rejections logged by pharmacies
CREATE TABLE rejections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  reject_code TEXT NOT NULL REFERENCES ncpdp_reject_codes(code),
  pbm_name TEXT,
  pbm_bin TEXT,
  pbm_pcn TEXT,
  drug_ndc TEXT,
  drug_name TEXT,
  insurance_type insurance_type DEFAULT 'other',
  patient_id_hash TEXT,
  state TEXT,
  rejection_timestamp TIMESTAMPTZ DEFAULT now(),
  status rejection_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Resolutions for rejections
CREATE TABLE rejection_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rejection_id UUID NOT NULL REFERENCES rejections(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  action_taken TEXT NOT NULL,
  action_category action_category DEFAULT 'other',
  override_code_used TEXT,
  outcome resolution_outcome,
  revenue_recovered DECIMAL(10,2) DEFAULT 0,
  time_to_resolve_minutes INTEGER,
  notes TEXT,
  is_shared BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Votes on resolutions
CREATE TABLE resolution_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES rejection_resolutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  vote vote_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(resolution_id, user_id)
);

-- Indexes
CREATE INDEX idx_rejections_pharmacy ON rejections(pharmacy_id);
CREATE INDEX idx_rejections_code ON rejections(reject_code);
CREATE INDEX idx_rejections_pbm ON rejections(pbm_name);
CREATE INDEX idx_rejections_drug ON rejections(drug_name);
CREATE INDEX idx_rejections_status ON rejections(status);
CREATE INDEX idx_rejections_created ON rejections(created_at DESC);
CREATE INDEX idx_resolutions_rejection ON rejection_resolutions(rejection_id);
CREATE INDEX idx_resolutions_shared ON rejection_resolutions(is_shared) WHERE is_shared = true;
CREATE INDEX idx_votes_resolution ON resolution_votes(resolution_id);

-- Triggers
CREATE TRIGGER rejections_updated_at
  BEFORE UPDATE ON rejections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE ncpdp_reject_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejections ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejection_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolution_votes ENABLE ROW LEVEL SECURITY;

-- NCPDP codes: readable by all authenticated users
CREATE POLICY ncpdp_codes_select ON ncpdp_reject_codes
  FOR SELECT TO authenticated USING (true);

-- Rejections: pharmacy-scoped
CREATE POLICY rejections_select ON rejections
  FOR SELECT TO authenticated
  USING (pharmacy_id IN (SELECT pharmacy_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY rejections_insert ON rejections
  FOR INSERT TO authenticated
  WITH CHECK (pharmacy_id IN (SELECT pharmacy_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY rejections_update ON rejections
  FOR UPDATE TO authenticated
  USING (pharmacy_id IN (SELECT pharmacy_id FROM users WHERE users.id = auth.uid()));

-- Resolutions: own pharmacy can CRUD, shared ones readable by all
CREATE POLICY resolutions_select_own ON rejection_resolutions
  FOR SELECT TO authenticated
  USING (pharmacy_id IN (SELECT pharmacy_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY resolutions_select_shared ON rejection_resolutions
  FOR SELECT TO authenticated
  USING (is_shared = true);

CREATE POLICY resolutions_insert ON rejection_resolutions
  FOR INSERT TO authenticated
  WITH CHECK (pharmacy_id IN (SELECT pharmacy_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY resolutions_update ON rejection_resolutions
  FOR UPDATE TO authenticated
  USING (pharmacy_id IN (SELECT pharmacy_id FROM users WHERE users.id = auth.uid()));

-- Votes: user can manage their own votes
CREATE POLICY votes_select ON resolution_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY votes_insert ON resolution_votes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY votes_update ON resolution_votes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY votes_delete ON resolution_votes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
