import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

async function runTests() {
  console.log('🏁 Starting Verification Tests...');

  // Get dynamic employee list
  const getEmployees = await request('/employees');
  assert.strictEqual(getEmployees.status, 200);
  assert(Array.isArray(getEmployees.data.data));
  const testEmployee = getEmployees.data.data[0];
  assert(testEmployee, 'No seeded employees found');
  const employeeId = testEmployee.id;
  console.log(`Using test employee: ${testEmployee.name} (ID: ${employeeId})`);

  // 1. Get initial notifications list
  console.log('\n--- 1. Testing GET /notifications ---');
  const getInit = await request('/notifications');
  assert.strictEqual(getInit.status, 200);
  assert.strictEqual(getInit.data.success, true);
  assert(Array.isArray(getInit.data.data));
  const initialCount = getInit.data.data.length;
  console.log(`Initial notification count: ${initialCount}`);

  // 2. Test POST /notifications with valid employee
  console.log('\n--- 2. Testing POST /notifications ---');
  const validPost = await request('/notifications', {
    method: 'POST',
    body: JSON.stringify({
      employeeId,
      message: 'Test custom notification',
    }),
  });
  assert.strictEqual(validPost.status, 201);
  assert.strictEqual(validPost.data.success, true);
  assert.strictEqual(validPost.data.data.employeeId, employeeId);
  assert.strictEqual(validPost.data.data.message, 'Test custom notification');
  assert.strictEqual(validPost.data.data.read, false);
  const createdNotificationId = validPost.data.data.id;
  console.log(`Created Notification ID: ${createdNotificationId}`);

  // 3. Test POST /notifications with missing employee
  console.log('\n--- 3. Testing POST /notifications (Employee not found) ---');
  const missingEmpPost = await request('/notifications', {
    method: 'POST',
    body: JSON.stringify({
      employeeId: 99999,
      message: 'This employee does not exist',
    }),
  });
  assert.strictEqual(missingEmpPost.status, 404);
  assert.strictEqual(missingEmpPost.data.success, false);
  assert.match(missingEmpPost.data.message, /Employee not found/);
  console.log('Got expected 404 Employee not found.');

  // 4. Test POST /notifications with invalid payload
  console.log('\n--- 4. Testing POST /notifications (Invalid payload) ---');
  const invalidPost = await request('/notifications', {
    method: 'POST',
    body: JSON.stringify({
      employeeId: 'abc', // should be number
      message: '',
    }),
  });
  assert.strictEqual(invalidPost.status, 400);
  assert.strictEqual(invalidPost.data.success, false);
  console.log('Got expected 400 Bad Request.');

  // 5. Test GET /notifications/:id (valid and invalid)
  console.log('\n--- 5. Testing GET /notifications/:id ---');
  const getById = await request(`/notifications/${createdNotificationId}`);
  assert.strictEqual(getById.status, 200);
  assert.strictEqual(getById.data.success, true);
  assert.strictEqual(getById.data.data.id, createdNotificationId);

  const getByIdMissing = await request('/notifications/99999');
  assert.strictEqual(getByIdMissing.status, 404);
  assert.strictEqual(getByIdMissing.data.success, false);
  console.log('GET by ID verification successful.');

  // 6. Test PATCH /notifications/:id (mark as read)
  console.log('\n--- 6. Testing PATCH /notifications/:id (Mark as read) ---');
  const patchRead = await request(`/notifications/${createdNotificationId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      isRead: true,
    }),
  });
  assert.strictEqual(patchRead.status, 200);
  assert.strictEqual(patchRead.data.success, true);
  assert.strictEqual(patchRead.data.data.read, true);

  const getByIdAfterPatch = await request(`/notifications/${createdNotificationId}`);
  assert.strictEqual(getByIdAfterPatch.data.data.read, true);
  console.log('Mark as read verification successful.');

  // 7. Test GET /notifications/employee/:employeeId
  console.log('\n--- 7. Testing GET /notifications/employee/:employeeId ---');
  const getEmpNotifications = await request(`/notifications/employee/${employeeId}`);
  assert.strictEqual(getEmpNotifications.status, 200);
  assert.strictEqual(getEmpNotifications.data.success, true);
  assert(Array.isArray(getEmpNotifications.data.data));
  assert(getEmpNotifications.data.data.length > 0);
  console.log(`Fetched ${getEmpNotifications.data.data.length} notifications for employee ${employeeId}.`);

  const getEmpNotificationsMissing = await request('/notifications/employee/99999');
  assert.strictEqual(getEmpNotificationsMissing.status, 404);
  console.log('GET employee notifications validated.');

  // 8. Test DELETE /notifications/:id
  console.log('\n--- 8. Testing DELETE /notifications/:id ---');
  const deleteNotif = await request(`/notifications/${createdNotificationId}`, {
    method: 'DELETE',
  });
  assert.strictEqual(deleteNotif.status, 200);
  assert.strictEqual(deleteNotif.data.success, true);

  const getDeleted = await request(`/notifications/${createdNotificationId}`);
  assert.strictEqual(getDeleted.status, 404);
  console.log('DELETE verification successful.');

  // 9. Integration Flow: Challenge Creation notifies all employees
  console.log('\n--- 9. Testing Challenge Creation notifies all employees ---');
  // Let's get count of all employees
  const employeesCount = getEmployees.data.data.length;
  console.log(`System has ${employeesCount} employees.`);

  const newChallenge = await request('/challenges', {
    method: 'POST',
    body: JSON.stringify({
      title: 'New Eco Challenge ' + Date.now(),
      description: 'Test challenge creation notification',
      xpReward: 10,
      difficulty: 'Easy',
      deadline: new Date(Date.now() + 86400000).toISOString(),
      status: 'ACTIVE',
    }),
  });
  assert.strictEqual(newChallenge.status, 201);
  const challengeId = newChallenge.data.data.id;
  console.log(`Created Challenge ID: ${challengeId}`);

  // Check that all employees received a notification for this new challenge
  const allNotifsAfterChallenge = await request('/notifications');
  const newNotifs = allNotifsAfterChallenge.data.data.filter(n => n.message.includes(newChallenge.data.data.title));
  assert.strictEqual(newNotifs.length, employeesCount);
  console.log(`All ${employeesCount} employees notified successfully.`);

  // 10. Integration Flow: Reward redemption notifies the employee
  console.log('\n--- 10. Testing Reward Redemption notifies employee ---');
  // Find a reward with stock and pointsRequired <= employee's points
  const rewardsRes = await request('/rewards');
  const reward = rewardsRes.data.data.find(r => r.stock > 0 && r.pointsRequired <= testEmployee.points);
  assert(reward, `Need a seeded reward with pointsRequired <= ${testEmployee.points}`);
  console.log(`Using Reward: ${reward.name} (requires ${reward.pointsRequired} points)`);

  const redeemRes = await request(`/rewards/${reward.id}/redeem`, {
    method: 'POST',
    body: JSON.stringify({
      employeeId,
    }),
  });
  assert.strictEqual(redeemRes.status, 201);
  console.log('Reward redeemed successfully.');

  // Check employee notifications
  const empNotifsAfterRedeem = await request(`/notifications/employee/${employeeId}`);
  const redeemNotif = empNotifsAfterRedeem.data.data.find(n => n.message === '🎁 Reward redeemed successfully.');
  assert(redeemNotif, 'Should find reward redeemed notification');
  console.log('Reward redemption notification successfully generated.');

  // 11. Integration Flow: Challenge completion creates notifications (completion & badges)
  console.log('\n--- 11. Testing Challenge Completion creates notifications ---');
  // First join the challenge
  const joinRes = await request('/participations', {
    method: 'POST',
    body: JSON.stringify({
      employeeId,
      challengeId: challengeId,
      status: 'joined',
    }),
  });
  assert.strictEqual(joinRes.status, 201);
  const participationId = joinRes.data.data.id;
  console.log(`Employee joined challenge. Participation ID: ${participationId}`);

  // Complete challenge
  const completeRes = await request(`/participations/${participationId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'completed',
    }),
  });
  assert.strictEqual(completeRes.status, 200);
  console.log('Challenge marked completed.');

  // Check employee notifications for completion
  const empNotifsAfterComplete = await request(`/notifications/employee/${employeeId}`);
  const completeNotif = empNotifsAfterComplete.data.data.find(n => n.message === '🌱 Challenge completed successfully.');
  assert(completeNotif, 'Should find challenge completed notification');
  console.log('Challenge completion notification successfully generated.');

  // 12. Testing Badge Award creates notifications
  console.log('\n--- 12. Testing Badge Award creates notifications ---');
  const awardBadgesRes = await request(`/badges/award/${employeeId}`, {
    method: 'POST',
  });
  assert.strictEqual(awardBadgesRes.status, 200);
  console.log('Manual badge award executed.');

  // Check if congratulations notifications exist
  const empNotifsAll = await request(`/notifications/employee/${employeeId}`);
  const badgeNotifs = empNotifsAll.data.data.filter(n => n.message.includes('🏆 Congratulations!'));
  console.log(`Found ${badgeNotifs.length} badge congratulations notifications for employee ${employeeId}.`);
  badgeNotifs.forEach(n => console.log(`  - ${n.message}`));

  console.log('\n🎉 All Verification Tests Passed Successfully!');
}

runTests().catch(err => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
