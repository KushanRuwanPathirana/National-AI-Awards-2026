const EvaluationCriteria = require('../models/EvaluationCriteria.model');
const logger = require('../utils/logger');

const ORGANIZATIONAL_CRITERIA = [
  { name: 'Innovation & Originality', weight: 20, maxScore: 20, description: 'Novelty of the AI solution, creativity, and uniqueness compared to existing approaches.', order: 1 },
  { name: 'Measurable Impact', weight: 25, maxScore: 25, description: 'Demonstrated business, societal, or national impact supported by measurable outcomes, KPIs, revenue or evidence.', order: 2 },
  { name: 'Technical Excellence', weight: 20, maxScore: 20, description: 'AI architecture, technical implementation, robustness, performance, and engineering quality.', order: 3 },
  { name: 'Responsible AI & Governance', weight: 15, maxScore: 15, description: 'Ethical AI practices, transparency, fairness, privacy, security, and regulatory compliance.', order: 4 },
  { name: 'Scalability & Sustainability', weight: 10, maxScore: 10, description: 'Ability to scale, long-term viability, maintainability, and adaptability.', order: 5 },
  { name: 'Execution & Evidence', weight: 10, maxScore: 10, description: 'Quality of implementation, supporting documentation, demonstrations, customer validation, and measurable proof.', order: 6 },
];

const INDIVIDUAL_CRITERIA = [
  { name: 'Strategic AI Vision & Leadership', weight: 25, maxScore: 25, description: 'Evidence that the leader has developed and championed an AI strategy, secured executive sponsorship, positioned AI as a strategic capability, and created an AI-enabled culture.', order: 1 },
  { name: 'Business & Societal Impact', weight: 25, maxScore: 25, description: 'Demonstrated measurable outcomes through AI.', order: 2 },
  { name: 'Responsible AI Leadership', weight: 15, maxScore: 15, description: 'Leadership in AI governance, data governance, ethics, risk management, and regulatory compliance.', order: 3 },
  { name: 'Innovation & Thought Leadership', weight: 15, maxScore: 15, description: 'Contribution to advancing AI practice.', order: 4 },
  { name: 'Talent & Workforce Development', weight: 10, maxScore: 10, description: 'Investment in capability building.', order: 5 },
  { name: 'Ecosystem & National Contribution', weight: 10, maxScore: 10, description: 'Contribution beyond the organization.', order: 6 },
];

const seedCriteriaOnStartup = async () => {
  let created = 0;
  let updated = 0;

  const stages = [
    { key: 'initial', prefix: 'Screening - ' },
    { key: 'f2f', prefix: 'Viva - ' }
  ];

  for (const stg of stages) {
    // Seed organizational criteria
    for (const c of ORGANIZATIONAL_CRITERIA) {
      const stageName = `${stg.prefix}${c.name}`;
      const exists = await EvaluationCriteria.findOne({ name: stageName, criteriaType: 'organizational', stage: stg.key });
      if (!exists) {
        await EvaluationCriteria.create({
          name: stageName,
          weight: c.weight,
          maxScore: c.maxScore || 10,
          description: c.description,
          order: c.order,
          criteriaType: 'organizational',
          isActive: true,
          stage: stg.key
        });
        created++;
      } else if (exists.maxScore !== c.maxScore || exists.weight !== c.weight) {
        exists.maxScore = c.maxScore;
        exists.weight = c.weight;
        exists.description = c.description;
        await exists.save();
        updated++;
      }
    }

    // Seed individual criteria
    for (const c of INDIVIDUAL_CRITERIA) {
      const stageName = `${stg.prefix}${c.name}`;
      const exists = await EvaluationCriteria.findOne({ name: stageName, criteriaType: 'individual', stage: stg.key });
      if (!exists) {
        await EvaluationCriteria.create({
          name: stageName,
          weight: c.weight,
          maxScore: c.maxScore || 10,
          description: c.description,
          order: c.order,
          criteriaType: 'individual',
          isActive: true,
          stage: stg.key
        });
        created++;
      } else if (exists.maxScore !== c.maxScore || exists.weight !== c.weight) {
        exists.maxScore = c.maxScore;
        exists.weight = c.weight;
        exists.description = c.description;
        await exists.save();
        updated++;
      }
    }
  }

  // Tag any old criteria that don't have criteriaType set
  await EvaluationCriteria.updateMany(
    { criteriaType: { $exists: false } },
    { $set: { criteriaType: 'organizational' } }
  );
  await EvaluationCriteria.updateMany(
    { criteriaType: null },
    { $set: { criteriaType: 'organizational' } }
  );

  // Tag any old criteria that don't have stage set
  await EvaluationCriteria.updateMany(
    { stage: { $exists: false } },
    { $set: { stage: 'initial' } }
  );
  await EvaluationCriteria.updateMany(
    { stage: null },
    { $set: { stage: 'initial' } }
  );

  if (created > 0 || updated > 0) {
    logger.info(`✅ Evaluation criteria: ${created} created, ${updated} updated`);
  } else {
    logger.info('Evaluation criteria already up to date — skipping seed.');
  }
};

module.exports = { seedCriteriaOnStartup };
