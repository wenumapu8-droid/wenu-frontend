export type VerificationState = 'VERIFIED' | 'INFERRED' | 'NEEDS_CONFIRMATION';

export type OcinProjectFact = {
  label: string;
  value: string;
  state: VerificationState;
};

export type OcinProjectAssetGroup = {
  key: string;
  count: number;
  relation: 'VERIFIED_PROJECT_GROUP' | 'INFERRED_PROJECT_LINK' | 'PROCESS_EVIDENCE';
  role: string;
  evidence: string;
  publicDefault: string;
};

export type OcinProjectRecord = {
  id: string;
  title: string;
  titleState: VerificationState;
  projectClass: string;
  projectClassState: VerificationState;
  facts: OcinProjectFact[];
  assetGroups: OcinProjectAssetGroup[];
  verifiedVisualEvidence: string[];
  caseStudyStatus: 'STRUCTURE_READY_FACTS_PENDING' | 'EDITORIAL_READY' | 'PUBLIC_APPROVED';
  publicApproval: boolean;
  kodexRelation: string;
};

export const MUSHROOM_ELIXIR_REVIEW_V0: OcinProjectRecord = {
  id: 'OCN-PRJ-001',
  title: 'MUSHROOM ELIXIR',
  titleState: 'VERIFIED',
  projectClass: 'BRAND / VISUAL IDENTITY',
  projectClassState: 'INFERRED',
  facts: [
    { label: 'CLIENT', value: 'NEEDS CONFIRMATION', state: 'NEEDS_CONFIRMATION' },
    { label: 'YEAR', value: 'NEEDS CONFIRMATION', state: 'NEEDS_CONFIRMATION' },
    { label: 'ROLE', value: 'NEEDS CONFIRMATION', state: 'NEEDS_CONFIRMATION' },
    { label: 'SCOPE', value: 'NEEDS CONFIRMATION', state: 'NEEDS_CONFIRMATION' },
  ],
  assetGroups: [
    {
      key: '1000040838',
      count: 20,
      relation: 'VERIFIED_PROJECT_GROUP',
      role: 'identity / mark / applications',
      evidence: 'Reviewed assets include a visible MUSHROOM ELIXIR identity application and concentric geometric mark studies.',
      publicDefault: 'CASE STUDY ASSETS',
    },
    {
      key: 'image3A352',
      count: 10,
      relation: 'INFERRED_PROJECT_LINK',
      role: 'contour / tunnel visual system',
      evidence: 'A separate process screenshot visibly associates image3A352_mirror.jpg with the words Elixir mushroom.',
      publicDefault: 'SELECTED CASE STUDY SYSTEM ASSETS',
    },
    {
      key: 'image3A1000002123',
      count: 1,
      relation: 'PROCESS_EVIDENCE',
      role: 'process screenshot',
      evidence: 'The screenshot supplies project-link evidence and is not treated as a standalone artwork.',
      publicDefault: 'INTERNAL PROCESS EVIDENCE',
    },
  ],
  verifiedVisualEvidence: [
    'A concentric / hexagonal geometric mark study exists in the project source group.',
    'A reviewed application visibly contains the words MUSHROOM ELIXIR and a central geometric mark.',
    'A separate process screenshot links image3A352_mirror.jpg to Elixir mushroom, expanding the known visual-system lineage.',
  ],
  caseStudyStatus: 'STRUCTURE_READY_FACTS_PENDING',
  publicApproval: false,
  kodexRelation: 'OPTIONAL SECONDARY ACTIVATION. The case study remains primary; any KODEX reuse must derive from reviewed authored mechanisms rather than project mythology.',
};
