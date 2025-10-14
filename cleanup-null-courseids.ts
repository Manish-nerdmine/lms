/**
 * Cleanup Script for Null CourseIds
 * 
 * This script removes all null courseId entries from groups
 * Run with: npx ts-node cleanup-null-courseids.ts
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

async function cleanupNullCourseIds() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected!\n');

    const db = client.db();
    const groupsCollection = db.collection('groups');

    // Step 1: Count groups with null courseIds
    console.log('📊 Step 1: Checking for null courseIds...');
    const groupsWithNullCourses = await groupsCollection
      .find({ 'courses.courseId': null })
      .toArray();
    
    console.log(`Found ${groupsWithNullCourses.length} groups with null courseIds\n`);

    if (groupsWithNullCourses.length === 0) {
      console.log('✅ No null courseIds found. Database is clean!');
      return;
    }

    // Step 2: Show affected groups
    console.log('📋 Step 2: Groups affected:');
    groupsWithNullCourses.forEach((group: any) => {
      const nullCourses = group.courses.filter((c: any) => c.courseId === null);
      console.log(`  • ${group.name} (${group._id})`);
      console.log(`    Total courses: ${group.courses.length}`);
      console.log(`    Null courses: ${nullCourses.length}`);
      console.log(`    Valid courses: ${group.courses.length - nullCourses.length}`);
      console.log('');
    });

    // Step 3: Remove null courseIds
    console.log('🧹 Step 3: Cleaning up null courseIds...');
    const updateResult = await groupsCollection.updateMany(
      {},
      {
        $pull: {
          courses: { courseId: null }
        } as any
      }
    );

    console.log(`✅ Modified ${updateResult.modifiedCount} groups\n`);

    // Step 4: Verify cleanup
    console.log('✔️  Step 4: Verifying cleanup...');
    const remainingNulls = await groupsCollection.countDocuments({
      'courses.courseId': null
    });

    if (remainingNulls === 0) {
      console.log('✅ All null courseIds have been removed!\n');
    } else {
      console.log(`⚠️  Warning: ${remainingNulls} groups still have null courseIds\n`);
    }

    // Step 5: Show final state
    console.log('📊 Step 5: Final state of groups:');
    const allGroups = await groupsCollection
      .find({})
      .project({ name: 1, courses: 1 })
      .toArray();

    allGroups.forEach((group: any) => {
      console.log(`\n  Group: ${group.name} (${group._id})`);
      console.log(`  Total courses: ${group.courses.length}`);
      
      if (group.courses.length > 0) {
        group.courses.forEach((course: any, idx: number) => {
          console.log(`    ${idx + 1}. CourseId: ${course.courseId || 'NULL'} | Due: ${course.dueDate}`);
        });
      } else {
        console.log('    No courses assigned');
      }
    });

    console.log('\n\n✅ Cleanup completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Re-assign courses to groups using the API: POST /groups/:id/assign-course');
    console.log('2. The new assignments will have proper ObjectId values');
    console.log('3. Test the aggregation endpoint: GET /groups/:id/users\n');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupNullCourseIds()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

