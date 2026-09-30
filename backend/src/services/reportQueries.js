// One row per report; latest assessment avoids inflating counts in legacy data.
const reportsQuery = `
 SELECT r.hazard_id AS report_id, 'hazard' AS report_type, r.report_title,
 r.report_date, r.building_id, b.building_name, r.exact_area, r.description,
 r.risk_associated, r.preventive_action, r.action_taken, r.affected_others,
 r.status, r.status AS report_status, r.reported_by, r.created_at,
 concat_ws(' ',u.first_name,u.last_name) AS employee_name, u.email AS employee_email,
 a.assessment_id, a.assessment_date, a.assessed_by, a.likelihood, a.severity,
 a.risk_score, a.risk_level, a.control_action, a.responsible_unit, a.expected_output,
 a.target_date, a.assessment_status, a.accomplished_date, a.remarks, a.review_status,
 a.reviewed_by, concat_ws(' ', reviewer.first_name, reviewer.last_name) AS reviewed_by_name,
 a.reviewed_at, a.created_at AS assessment_created_at, a.updated_at AS assessment_updated_at,
 ARRAY(SELECT hazard_type FROM hazard_report_types WHERE hazard_id=r.hazard_id) AS categories
 FROM hazard_reports r LEFT JOIN buildings b USING(building_id)
 LEFT JOIN users u ON u.user_id=r.reported_by
 LEFT JOIN LATERAL (SELECT * FROM hazard_assessments WHERE hazard_id=r.hazard_id ORDER BY created_at DESC, assessment_id DESC LIMIT 1) a ON true
 LEFT JOIN users reviewer ON reviewer.user_id=a.reviewed_by
 UNION ALL
 SELECT r.incident_id, 'incident', 'Incident Report #' || r.incident_id,
 r.report_date, r.building_id, b.building_name, r.exact_area, r.description,
 NULL::text, NULL::text, r.action_taken, NULL::text,
 r.status, r.status, r.reported_by, r.created_at,
 concat_ws(' ',u.first_name,u.last_name), u.email,
 a.assessment_id, a.assessment_date, a.assessed_by, a.initial_likelihood, a.initial_severity,
 a.initial_risk_score, a.initial_risk_level, a.corrective_action, a.responsible_unit, a.actual_consequence,
 a.target_date, a.assessment_status, a.accomplished_date, a.osho_remarks, a.review_status,
 a.reviewed_by, concat_ws(' ',reviewer.first_name,reviewer.last_name),
 a.reviewed_at, a.created_at, a.updated_at,
 ARRAY(SELECT incident_type FROM incident_types WHERE incident_id=r.incident_id)
 FROM incident_reports r LEFT JOIN buildings b USING(building_id)
 LEFT JOIN users u ON u.user_id=r.reported_by
 LEFT JOIN LATERAL (SELECT * FROM incident_assessments WHERE incident_id=r.incident_id ORDER BY created_at DESC, assessment_id DESC LIMIT 1) a ON true
 LEFT JOIN users reviewer ON reviewer.user_id=a.reviewed_by`;
module.exports = { reportsQuery };
