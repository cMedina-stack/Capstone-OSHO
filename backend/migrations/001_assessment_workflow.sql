-- Add fields used by the incident form without removing existing reports or assessments.
ALTER TABLE incident_assessments
  ADD COLUMN IF NOT EXISTS initial_likelihood integer CHECK (initial_likelihood BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS initial_severity integer CHECK (initial_severity BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS initial_risk_score integer,
  ADD COLUMN IF NOT EXISTS initial_risk_level varchar(20),
  ADD COLUMN IF NOT EXISTS residual_likelihood integer CHECK (residual_likelihood BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS residual_severity integer CHECK (residual_severity BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS residual_risk_score integer,
  ADD COLUMN IF NOT EXISTS residual_risk_level varchar(20),
  ADD COLUMN IF NOT EXISTS review_status varchar(20) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','needs_revision')),
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(user_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp;
ALTER TABLE incident_assessments DROP CONSTRAINT IF EXISTS incident_assessments_assessment_status_check;
ALTER TABLE incident_assessments ADD CONSTRAINT incident_assessments_assessment_status_check CHECK (assessment_status IN ('pending','under_review','action_required','monitoring','completed','closed','resolved'));
-- Fail instead of deleting historical duplicates. The operator can review them if present.
CREATE UNIQUE INDEX IF NOT EXISTS hazard_assessments_one_per_report ON hazard_assessments(hazard_id);
CREATE UNIQUE INDEX IF NOT EXISTS incident_assessments_one_per_report ON incident_assessments(incident_id);
