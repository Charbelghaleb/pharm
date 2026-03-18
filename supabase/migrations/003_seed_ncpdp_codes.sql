-- Seed NCPDP Rejection Codes with plain-English translations
-- Based on NCPDP External Code List (ECL) reject codes

INSERT INTO ncpdp_reject_codes (code, short_description, plain_english, category, common_causes, general_resolution_steps) VALUES

-- Eligibility & Coverage
('1', 'M/I BIN Number', 'The BIN (Bank Identification Number) submitted is missing or invalid. The system cannot route the claim to the correct insurance processor.', 'data_validation',
  ARRAY['Incorrect BIN entered', 'Outdated insurance card', 'Wrong insurance selected'],
  ARRAY['Verify BIN from current insurance card', 'Check for updated card information', 'Contact PBM for correct BIN']),

('6', 'M/I Group ID', 'The group ID number is missing or does not match the insurance records. The plan cannot identify which employer group the patient belongs to.', 'data_validation',
  ARRAY['Group ID not entered', 'Incorrect group number', 'Patient changed employers'],
  ARRAY['Check insurance card for correct group ID', 'Ask patient for updated card', 'Call PBM to verify group number']),

('7', 'M/I Cardholder ID', 'The member ID or cardholder ID submitted does not match the insurance records.', 'eligibility',
  ARRAY['Typo in member ID', 'Patient using old card', 'Dependent vs subscriber ID confusion'],
  ARRAY['Re-enter member ID carefully from card', 'Verify subscriber vs dependent ID', 'Call PBM member services']),

('8', 'M/I Person Code', 'The person code (which identifies the specific family member) is missing or invalid.', 'data_validation',
  ARRAY['Person code not entered', 'Wrong person code for dependent', 'Code format differs by PBM'],
  ARRAY['Enter correct person code (01=subscriber, 02=spouse, 03+=children)', 'Verify with insurance card', 'Call PBM if unsure']),

('10', 'M/I Date of Birth', 'The date of birth submitted does not match the insurance records for this member.', 'data_validation',
  ARRAY['Typo in DOB', 'DOB not on file with PBM', 'Wrong patient selected'],
  ARRAY['Verify DOB with patient', 'Re-enter correctly', 'Call PBM if DOB is correct but still rejecting']),

('15', 'M/I Number of Refills Authorized', 'The number of refills on the prescription is missing or invalid.', 'refill_policy',
  ARRAY['Refills not entered in system', 'Exceeds allowed refills', 'Controlled substance refill limits'],
  ARRAY['Verify refills authorized on prescription', 'Contact prescriber for new Rx if expired', 'Check state/federal limits for controlled substances']),

('19', 'M/I Days Supply', 'The days supply submitted is missing or does not match expected values for the quantity and drug dispensed.', 'data_validation',
  ARRAY['Days supply not matching quantity', 'Plan limit exceeded', 'Incorrect calculation'],
  ARRAY['Recalculate days supply based on sig', 'Reduce to plan maximum days supply', 'Adjust quantity to match allowed days supply']),

('20', 'M/I Compound Code', 'The compound code is missing or invalid. Required when billing a compound prescription.', 'data_validation',
  ARRAY['Compound code not set', 'Wrong compound indicator', 'Missing compound ingredients'],
  ARRAY['Set compound code to 2 for compounds', 'Enter all compound ingredients with quantities', 'Verify pricing for each ingredient']),

('21', 'M/I Product/Service ID Qualifier', 'The NDC qualifier is missing or invalid.', 'data_validation',
  ARRAY['Qualifier not set to 03 for NDC', 'System configuration issue'],
  ARRAY['Set qualifier to 03 (NDC)', 'Check pharmacy system settings']),

('22', 'M/I Dispense as Written (DAW) Code', 'The DAW code is missing or does not match what the plan expects for this drug.', 'data_validation',
  ARRAY['DAW not set', 'Brand dispensed without proper DAW', 'Generic available but brand billed'],
  ARRAY['Set appropriate DAW code (0=no preference, 1=physician requests brand)', 'Switch to generic if available', 'Get dispense as written from prescriber']),

('25', 'M/I Prescriber ID', 'The prescriber NPI or identification number is missing or invalid.', 'data_validation',
  ARRAY['NPI not entered', 'Inactive NPI', 'Wrong prescriber selected'],
  ARRAY['Enter correct prescriber NPI', 'Verify NPI at nppes.cms.hhs.gov', 'Update prescriber record in system']),

('40', 'Non-Matched Cardholder ID', 'The member ID submitted does not match any active member in the insurance plan database.', 'eligibility',
  ARRAY['Patient not enrolled', 'Coverage terminated', 'Wrong insurance billed', 'ID has leading zeros or spaces'],
  ARRAY['Verify current enrollment with patient', 'Try alternate ID formats', 'Check if coverage is active', 'Bill secondary insurance if primary terminated']),

('41', 'Submit Bill To Other Processor', 'This claim should be billed to a different insurance processor. The current processor is not the correct one.', 'eligibility',
  ARRAY['Patient has new insurance', 'Wrong BIN/PCN used', 'Coordination of benefits issue'],
  ARRAY['Ask patient for current insurance card', 'Verify correct BIN/PCN/Group', 'Check for other coverage']),

('55', 'Non-Matched Prescriber ID', 'The prescriber NPI or DEA number does not match the insurance plan records.', 'data_validation',
  ARRAY['Prescriber not enrolled with plan', 'Inactive NPI', 'NPI not linked to prescriber in PBM system'],
  ARRAY['Verify prescriber NPI', 'Have prescriber enroll with the PBM network', 'Try DEA number if NPI fails']),

('56', 'Non-Matched Prescriber with State License', 'The prescriber is not properly licensed or their license cannot be verified.', 'data_validation',
  ARRAY['State license expired', 'License not on file with PBM', 'Out-of-state prescriber'],
  ARRAY['Verify prescriber license status', 'Have prescriber contact PBM', 'Ensure license is current']),

('65', 'Patient Not Covered', 'The patient does not have active coverage under this insurance plan. They are not eligible for benefits.', 'eligibility',
  ARRAY['Coverage terminated', 'Not yet effective', 'Wrong insurance billed', 'Patient dropped from plan'],
  ARRAY['Verify coverage dates with patient', 'Check if new plan is available', 'Ask patient to contact insurance', 'Bill cash or alternate insurance']),

('66', 'Patient Age Exceeds Maximum Age', 'The patient is too old for coverage of this medication under their current plan rules.', 'coverage',
  ARRAY['Pediatric-only medication', 'Age-restricted coverage', 'Aged out of parent plan'],
  ARRAY['Verify age-appropriate alternative exists', 'Contact prescriber for alternative', 'Check if prior auth can override']),

('67', 'Patient is Not Covered - Loss of Dependent Status', 'The dependent has lost coverage, typically due to aging out of the plan.', 'eligibility',
  ARRAY['Child turned 26', 'Divorce/separation', 'Dependent verification failed'],
  ARRAY['Patient needs own coverage', 'Check marketplace/employer options', 'Bill cash price']),

('69', 'Host Processing Error', 'A system error occurred at the insurance processor. The claim could not be processed due to a technical issue.', 'other',
  ARRAY['PBM system down', 'Network timeout', 'Database error at processor'],
  ARRAY['Wait 15-30 minutes and resubmit', 'Try different submission method', 'Call PBM help desk if persists']),

('70', 'Product/Service Not Covered', 'This specific drug or product is not covered under the patient''s insurance plan formulary.', 'coverage',
  ARRAY['Drug not on formulary', 'Exclusion list drug', 'OTC product billed', 'Cosmetic medication'],
  ARRAY['Check formulary for covered alternatives', 'Contact prescriber for therapeutic alternative', 'Submit prior authorization if medically necessary', 'Check manufacturer patient assistance programs']),

('71', 'Prescriber ID is Not Covered', 'The prescriber is not eligible to write prescriptions covered by this plan.', 'eligibility',
  ARRAY['Prescriber not in network', 'Prescriber type not covered', 'Out-of-state prescriber restrictions'],
  ARRAY['Verify prescriber network status', 'Have patient get new Rx from in-network prescriber', 'Contact PBM about prescriber enrollment']),

('75', 'Prior Authorization Required', 'This medication requires prior authorization from the insurance plan before it can be covered. The prescriber must submit clinical documentation to justify medical necessity.', 'prior_auth',
  ARRAY['Drug requires PA per formulary', 'Step therapy not met', 'Quantity exceeds limit requiring PA', 'Non-preferred drug'],
  ARRAY['Notify prescriber that PA is needed', 'Initiate PA process with PBM', 'Check if preferred alternative is available', 'Use CoverMyMeds or PBM PA portal', 'Dispense emergency supply if allowed']),

('76', 'Plan Limitations Exceeded', 'The prescription exceeds the plan''s quantity, days supply, or other coverage limits.', 'coverage',
  ARRAY['Quantity exceeds plan max', 'Days supply over limit', 'Maximum fills per time period reached', 'Dollar limit exceeded'],
  ARRAY['Reduce quantity/days supply to plan maximum', 'Split into multiple fills', 'Submit PA for quantity override', 'Check plan maximum limits']),

('77', 'Discontinued Product/Service ID Number', 'The NDC submitted is no longer active or has been discontinued by the manufacturer.', 'data_validation',
  ARRAY['Manufacturer discontinued product', 'NDC replaced with new number', 'Package size changed'],
  ARRAY['Look up current NDC for the drug', 'Check for equivalent product from different manufacturer', 'Update NDC in pharmacy system']),

('78', 'Cost Exceeds Maximum', 'The submitted cost of the medication exceeds the maximum allowable amount set by the insurance plan.', 'coverage',
  ARRAY['Acquisition cost too high', 'Usual and customary price above limit', 'Specialty drug pricing issue'],
  ARRAY['Review and adjust submitted price', 'Check MAC pricing', 'Contact PBM for pricing override', 'Consider alternative NDC/package size']),

('79', 'Refill Too Soon', 'The prescription is being filled too early. The plan requires a minimum time period between refills based on the previous fill days supply.', 'refill_policy',
  ARRAY['Patient filling before 75-80% of days supply used', 'Vacation/travel supply needed', 'Lost/stolen medication', 'Dose change'],
  ARRAY['Wait until refill date shown in rejection message', 'Request vacation override if traveling', 'Get prescriber to send new Rx for dose change', 'Submit override for lost/stolen with proper documentation']),

('80', 'Non-Matched NDC', 'The NDC (National Drug Code) submitted does not match the drug database records.', 'data_validation',
  ARRAY['Incorrect NDC entered', 'Repackaged NDC not recognized', 'New-to-market drug not yet loaded'],
  ARRAY['Verify NDC from product packaging', 'Try alternate manufacturer NDC', 'Contact PBM to add NDC']),

('82', 'Non-Matched Drug - Loss of Eligibility', 'The drug is no longer covered because the patient lost eligibility for this particular benefit.', 'eligibility',
  ARRAY['Coverage lapsed', 'Plan change mid-year', 'Drug removed from coverage'],
  ARRAY['Verify current coverage', 'Check for new plan details', 'Contact PBM for coverage status']),

('83', 'Duplicate Paid/Captured Claim', 'A claim for this same prescription has already been paid or is processing. This appears to be a duplicate submission.', 'refill_policy',
  ARRAY['Claim already submitted successfully', 'Filled at another pharmacy', 'System double-submitted'],
  ARRAY['Check if claim was already paid', 'Verify with patient if filled elsewhere', 'Reverse previous claim if error', 'Contact PBM for claim history']),

('85', 'Claim Not Processed', 'The claim was received but could not be processed due to a system or data issue.', 'other',
  ARRAY['System processing error', 'Invalid data combination', 'Timing issue'],
  ARRAY['Review all claim fields for accuracy', 'Resubmit the claim', 'Contact PBM if continues to fail']),

('88', 'DUR Reject Error', 'The Drug Utilization Review system flagged this prescription for a potential safety issue such as drug interaction, duplication, or dosage concern.', 'dur_clinical',
  ARRAY['Drug-drug interaction detected', 'Therapeutic duplication', 'Excessive dosage', 'Age/gender precaution', 'Allergy conflict'],
  ARRAY['Review DUR conflict details in rejection', 'Contact prescriber to address clinical concern', 'Submit appropriate DUR/PPS override codes', 'Document clinical justification', 'Use override codes: reason + professional service + result']),

('89', 'Rejected by Intermediary', 'The claim was rejected by the network intermediary before reaching the insurance plan.', 'other',
  ARRAY['Routing error', 'Switch/network issue', 'Invalid processor ID'],
  ARRAY['Verify BIN/PCN routing', 'Contact switch provider', 'Try resubmitting']),

('90', 'Host Hung Up', 'The insurance processor did not respond to the claim in time. The connection timed out.', 'other',
  ARRAY['PBM system overloaded', 'Network connectivity issue', 'Server timeout'],
  ARRAY['Wait a few minutes and resubmit', 'Check internet connectivity', 'Call PBM if persistent']),

('91', 'Claim Has Been Adjusted', 'This claim has already been adjusted or modified. A new version of this claim exists.', 'other',
  ARRAY['Claim was previously reversed and resubmitted', 'Retroactive adjustment applied'],
  ARRAY['Check claim history', 'Verify which version is current', 'Contact PBM for adjustment details']),

('92', 'System Unavailable/Host Unavailable', 'The insurance processor system is currently down or unreachable.', 'other',
  ARRAY['PBM system maintenance', 'Network outage', 'Server downtime'],
  ARRAY['Wait and retry in 15-30 minutes', 'Check PBM status page if available', 'Call PBM for system status update']),

('93', 'Batch Claim Cannot Be Processed', 'The batch of claims submitted cannot be processed at this time.', 'other',
  ARRAY['Batch submission error', 'File format issue', 'System limitation'],
  ARRAY['Submit claims individually', 'Check batch file format', 'Contact PBM support']),

('MR', 'Medication Non-Covered - Rx', 'The prescribed medication is specifically excluded from coverage under this plan.', 'coverage',
  ARRAY['Drug on exclusion list', 'Not FDA-approved for indication', 'Plan-specific exclusion'],
  ARRAY['Check formulary for covered alternatives', 'Request exception/appeal from PBM', 'Contact prescriber for alternative therapy']),

('ER', 'Age Restriction', 'The medication has an age restriction that prevents coverage for this patient.', 'coverage',
  ARRAY['Pediatric medication for adult', 'Adult medication for child', 'Age-specific formulary restriction'],
  ARRAY['Verify patient age', 'Check for age-appropriate alternative', 'Submit PA with clinical justification']),

('ED', 'Exceeds Daily Dose Limit', 'The prescribed dose exceeds the maximum daily dose recognized by the plan.', 'dur_clinical',
  ARRAY['Dosage above FDA recommended max', 'Incorrect sig/directions', 'Multiple prescriptions for same drug class'],
  ARRAY['Verify dosage with prescriber', 'Adjust quantity/days supply to reflect correct dose', 'Submit PA for high-dose therapy', 'Document clinical justification']),

('NF', 'Non-Formulary', 'This drug is not on the insurance plan formulary. A formulary alternative may be available.', 'coverage',
  ARRAY['Drug not on preferred list', 'Tier 4/5 non-covered drug', 'New drug not yet reviewed'],
  ARRAY['Check formulary for preferred alternative', 'Contact prescriber for formulary switch', 'Submit PA for non-formulary exception', 'Check if any tier exception process exists']),

('NR', 'Non-Matched Product/Service', 'The drug product submitted does not match the expected product for this claim.', 'data_validation',
  ARRAY['Wrong NDC selected', 'Generic vs brand mismatch', 'Package size discrepancy'],
  ARRAY['Verify correct NDC from stock bottle', 'Check brand/generic requirements', 'Update product selection']),

('PA', 'Prior Authorization (PA) On File Is Not Applicable To This Claim', 'A prior authorization exists but does not apply to this specific claim submission.', 'prior_auth',
  ARRAY['PA is for different drug/strength', 'PA expired', 'PA not linked to this pharmacy', 'Wrong PA number referenced'],
  ARRAY['Verify PA details match claim', 'Submit new PA if needed', 'Contact PBM to link PA to pharmacy', 'Check PA effective dates']),

('P4', 'Subsequent claims cannot be submitted for the prescription', 'No additional fills can be submitted. The prescription has reached its maximum allowed claims.', 'refill_policy',
  ARRAY['All refills used', 'Prescription expired', 'Plan benefit maximum reached'],
  ARRAY['Contact prescriber for new prescription', 'Verify refill count with PBM', 'Check if Rx needs renewal']),

('R8', 'M/I Other Payer ID Count', 'The coordination of benefits (COB) information is missing or incorrect.', 'data_validation',
  ARRAY['Secondary insurance not entered correctly', 'COB fields incomplete', 'Wrong other payer information'],
  ARRAY['Enter primary insurance payment information', 'Submit other payer ID and amounts paid', 'Verify COB sequence with patient']),

('MN', 'Missing/Invalid Basis of Cost', 'The basis of cost determination is missing or invalid in the claim submission.', 'data_validation',
  ARRAY['Basis of cost field empty', 'Incorrect cost basis code', 'System not sending required field'],
  ARRAY['Set basis of cost to appropriate value', 'Check pharmacy system configuration', 'Contact software vendor if needed']),

('29', 'M/I Date of Service', 'The date of service on the claim is missing, in the future, or otherwise invalid.', 'data_validation',
  ARRAY['Future date entered', 'Date format incorrect', 'Service date before coverage start'],
  ARRAY['Verify and correct date of service', 'Ensure date is not in the future', 'Check coverage effective date']),

('26', 'M/I Unit of Measure', 'The unit of measure for the medication quantity is missing or incorrect.', 'data_validation',
  ARRAY['Unit not set (EA, ML, GM)', 'Wrong unit for dosage form', 'System default incorrect'],
  ARRAY['Set correct unit of measure (EA=each, ML=milliliter, GM=gram)', 'Match unit to dosage form', 'Update pharmacy system settings']),

('QE', 'Quantity Exceeds Maximum Allowed', 'The quantity requested exceeds the maximum allowed by the plan for this medication.', 'coverage',
  ARRAY['Exceeds plan quantity limit', 'Monthly maximum exceeded', 'Controlled substance quantity limit'],
  ARRAY['Reduce quantity to plan maximum', 'Submit PA for quantity override', 'Check plan quantity limits', 'Split into multiple partial fills if allowed']),

('QD', 'Quantity Below Minimum Allowed', 'The quantity submitted is below the minimum required by the plan.', 'coverage',
  ARRAY['Partial fill below plan minimum', 'Package quantity requirement', 'Plan minimum dispensing rules'],
  ARRAY['Increase to minimum required quantity', 'Verify plan minimum requirements', 'Contact PBM for override']),

('5C', 'NDC Not Covered', 'This specific NDC (product) is not covered, though the drug may be available under a different NDC.', 'coverage',
  ARRAY['Specific manufacturer not covered', 'Repackaged NDC excluded', 'Brand when generic required'],
  ARRAY['Try different manufacturer NDC', 'Switch to generic if available', 'Check plan preferred products list']),

('3E', 'Pharmacy Not Contracted', 'This pharmacy is not contracted or in-network with the patient''s insurance plan.', 'eligibility',
  ARRAY['Pharmacy not enrolled with PBM', 'Network exclusion', 'Contract expired'],
  ARRAY['Verify pharmacy network status', 'Direct patient to in-network pharmacy', 'Contact PBM about network enrollment', 'Check if emergency fill exception applies']);
