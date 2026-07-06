const test = require('node:test');
const assert = require('node:assert/strict');
const { authenticateLogin, registerUser } = require('../routes/auth');

test('fallback login accepts the default admin credentials when MongoDB is unavailable', async () => {
  const result = await authenticateLogin({
    email: 'admin@skillmatrix.ai',
    password: 'admin123',
    isDbReady: false,
  });

  assert.equal(result.success, true);
  assert.equal(result.user.role, 'admin');
  assert.equal(result.user.email, 'admin@skillmatrix.ai');
});

test('fallback login rejects unknown credentials when MongoDB is unavailable', async () => {
  const result = await authenticateLogin({
    email: 'someone@example.com',
    password: 'wrong-password',
    isDbReady: false,
  });

  assert.equal(result.success, false);
  assert.equal(result.statusCode, 400);
});

test('fallback registration creates a new account when MongoDB is unavailable', async () => {
  const result = await registerUser({
    name: 'Test User',
    email: 'newuser@example.com',
    password: 'Abcd1234!',
    role: 'student',
    isDbReady: false,
  });

  assert.equal(result.success, true);
  assert.equal(result.user.role, 'student');
  assert.equal(result.user.email, 'newuser@example.com');
});
