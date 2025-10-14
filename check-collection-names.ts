/**
 * Script to check actual collection names in MongoDB
 * Run with: npx ts-node check-collection-names.ts
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

async function checkCollectionNames() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected!\n');

    const db = client.db();

    // List all collections
    console.log('📋 All Collections in Database:');
    const collections = await db.listCollections().toArray();
    
    collections.forEach((col, idx) => {
      console.log(`${idx + 1}. ${col.name}`);
    });

    console.log('\n');

    // Check specific collections
    const employmentCollectionNames = collections
      .filter(c => c.name.toLowerCase().includes('employ'))
      .map(c => c.name);

    const groupCollectionNames = collections
      .filter(c => c.name.toLowerCase().includes('group'))
      .map(c => c.name);

    const courseCollectionNames = collections
      .filter(c => c.name.toLowerCase().includes('course'))
      .map(c => c.name);

    console.log('🔍 Employment-related collections:', employmentCollectionNames);
    console.log('🔍 Group-related collections:', groupCollectionNames);
    console.log('🔍 Course-related collections:', courseCollectionNames);

    // Check a specific group
    console.log('\n📊 Checking groups collection...');
    const groupsCollection = db.collection('groups');
    const groups = await groupsCollection.find({}).limit(5).toArray();
    
    console.log(`Found ${groups.length} groups`);
    if (groups.length > 0) {
      console.log('\nFirst group structure:');
      console.log(JSON.stringify(groups[0], null, 2));
    }

    // Check employment documents
    console.log('\n📊 Checking employment collections...');
    for (const colName of employmentCollectionNames) {
      const col = db.collection(colName);
      const count = await col.countDocuments();
      console.log(`  ${colName}: ${count} documents`);
      
      if (count > 0) {
        const sample = await col.findOne();
        console.log(`  Sample document structure:`, Object.keys(sample || {}));
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkCollectionNames()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

