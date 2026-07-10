const connectDB = require('../config/db');
const EvaluationCriteria = require('../models/EvaluationCriteria.model');

const cleanupOldCriteria = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Deactivate old criteria that don't have the proper stage prefix
    const result = await EvaluationCriteria.updateMany(
      { 
        $or: [
          { stage: { $exists: false } },
          { stage: null },
          { name: { $not: /^(Screening - |Viva - )/ } }
        ]
      },
      { $set: { isActive: false } }
    );

    console.log(`✅ Deactivated ${result.modifiedCount} old criteria`);

    // Verify the cleanup
    const activeCriteria = await EvaluationCriteria.find({ isActive: true });
    console.log(`\nActive criteria count: ${activeCriteria.length}`);
    console.log('Active criteria names:');
    activeCriteria.forEach(c => {
      console.log(`  - ${c.name} (stage: ${c.stage}, type: ${c.criteriaType})`);
    });

    console.log('\n✅ Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupOldCriteria();
