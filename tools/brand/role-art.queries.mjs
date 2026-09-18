/**
 * What each role and discipline is pictured as.
 *
 * The subjects are deliberately things, not people: the brief was to stop
 * illustrating role pages with photographs of identifiable staff, and a stock
 * photograph of a different stranger is the same mistake with better lighting.
 * A bridge says civil engineering; a person at a laptop says nothing that
 * thirty-two other pages do not also say.
 *
 * Terms are short on purpose. The CC0 half of the archive is small and the
 * search is strict, so "robotic arm factory automation" returns nothing while
 * "robot" returns two hundred - and a wrong-but-present picture can be fixed
 * with `pick`, while an absent one falls back to a drawing.
 *
 * `pick` is which result to take, chosen by eye from the contact sheets that
 * `npm run build-role-art -- --candidates` writes. The choice is then pinned by
 * id in public/roles/manifest.json, so a later run reproduces this set rather
 * than whatever the index holds that day.
 */
export const DISCIPLINE_QUERIES = {
  data: { query: "data", pick: 0 },
  engineering: { query: "industrial engineering", pick: 0 },
  finance: { query: "finance", pick: 4 },
  it: { query: "technology code", pick: 0 },
};

export const ROLE_QUERIES = {
  // Data
  "big-data-specialist": { query: "data", pick: 1 },
  "data-engineer": { query: "network cable", pick: 0 },
  "data-scientist": { query: "analytics chart", pick: 0 },
  "master-data-management-specialist": { query: "archive", pick: 0 },

  // Engineering
  "automation-engineer": { query: "robot", pick: 0 },
  "bim-modeler": { query: "architectural design", pick: 0 },
  "chemical-engineer": { query: "test tubes", pick: 0 },
  "civil-engineer": { query: "bridge architecture", pick: 0 },
  "document-controller": { query: "documents", pick: 0 },
  "electrical-engineer": { query: "power lines", pick: 0 },
  "fire-safety-engineer": { query: "fire extinguisher", pick: 0 },
  "maritime-engineer": { query: "cargo harbor", pick: 0 },
  "mechanical-engineer": { query: "machinery gear", pick: 0 },
  "naval-architect": { query: "shipyard", pick: 2 },
  "process-engineer": { query: "oil refinery", pick: 0 },
  projectmanager: { query: "whiteboard planning", pick: 2 },
  "structural-engineer": { query: "steel structure", pick: 0 },

  // Finance
  "bookkeeper-accountant": { query: "accounting", pick: 3 },
  "compliance-specialist": { query: "contract", pick: 2 },
  "cryptocurrency-blockchain-expert": { query: "bitcoin", pick: 5 },
  "financial-planning-expert": { query: "piggy bank", pick: 0 },
  "fintech-expert": { query: "credit card payment", pick: 4 },
  "insurance-expert": { query: "umbrella rain", pick: 0 },
  "risk-management-expert": { query: "balance scales", pick: 0 },
  "tax-specialist": { query: "calculator", pick: 0 },

  // IT
  "ai-specialist": { query: "circuit board", pick: 0 },
  "application-developer": { query: "programming code", pick: 0 },
  "application-manager": { query: "computer monitor", pick: 0 },
  "cloud-devops-engineer": { query: "server room", pick: 0 },
  "cybersecurity-specialist": { query: "padlock", pick: 2 },
  "database-administrator": { query: "hard drive", pick: 0 },
  "test-engineer": { query: "checklist", pick: 1 },
  "ui-ux-designer": { query: "wireframe sketch", pick: 0 },
};
