// MongoDB Script to Clean Up Null CourseIds
// Run this in MongoDB Shell or Compass

// Connect to your database first, then run:

// 1. Check how many groups have null courseIds
db.groups.find({ 'courses.courseId': null }).count();

// 2. Show which groups have null courseIds
print('\n=== Groups with null courseIds ===');
db.groups.find(
  { 'courses.courseId': null },
  { name: 1, 'courses': 1 }
).forEach(group => {
  print(`Group: ${group.name} (${group._id})`);
  print(`Total courses: ${group.courses.length}`);
  print(`Null courses: ${group.courses.filter(c => c.courseId === null).length}`);
  print('---');
});

// 3. Remove all null courseId entries from all groups
print('\n=== Cleaning up null courseIds ===');
const result = db.groups.updateMany(
  {},
  {
    $pull: {
      courses: { courseId: null }
    }
  }
);

print(`Modified ${result.modifiedCount} groups`);

// 4. Verify cleanup
print('\n=== Verification ===');
const remainingNulls = db.groups.find({ 'courses.courseId': null }).count();
print(`Groups with null courseIds remaining: ${remainingNulls}`);

// 5. Show updated groups
print('\n=== Updated Groups ===');
db.groups.find({}, { name: 1, 'courses': 1 }).forEach(group => {
  print(`Group: ${group.name} (${group._id})`);
  print(`Total courses: ${group.courses.length}`);
  group.courses.forEach((course, idx) => {
    print(`  Course ${idx + 1}: ${course.courseId} (Due: ${course.dueDate})`);
  });
  print('---');
});

print('\n✅ Cleanup completed!');

