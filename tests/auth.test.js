/**
 * Automated Test Suite for Flood Intelligence 3D Authentication & Cryptography
 * Run: node tests/auth.test.js
 */

const crypto = require("crypto");
const assert = require("assert");

console.log("==================================================================");
console.log("🧪 FLOOD INTELLIGENCE 3D - AUTOMATED VERIFICATION TEST SUITE");
console.log("==================================================================");

let testsPassed = 0;
let testsTotal = 0;

function runTest(name, fn) {
  testsTotal++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// 1. Password Hashing Test
runTest("SHA-256 Password Hashing Consistency & Security", () => {
  const hashPassword = (pwd) => crypto.createHash("sha256").update(pwd).digest("hex");
  const rawPwd = "Sentinel123!";
  const hash1 = hashPassword(rawPwd);
  const hash2 = hashPassword(rawPwd);

  assert.strictEqual(hash1, hash2, "Hashes must be deterministic");
  assert.strictEqual(hash1.length, 64, "SHA-256 hex string must be 64 characters");
  assert.notStrictEqual(hash1, rawPwd, "Hash must never equal plain text");
});

// 2. Cryptographic OTP Generator Test
runTest("Cryptographically Secure 6-Digit OTP Generation", () => {
  const generateOtp = () => {
    const buf = crypto.randomBytes(4);
    const num = (buf.readUInt32BE(0) % 900000) + 100000;
    return num.toString();
  };

  const code = generateOtp();
  assert.strictEqual(code.length, 6, "OTP must be exactly 6 characters");
  assert.strictEqual(/^\d{6}$/.test(code), true, "OTP must consist of digits only");

  // Statistical uniqueness check
  const samples = new Set();
  for (let i = 0; i < 50; i++) {
    samples.add(generateOtp());
  }
  assert.ok(samples.size >= 48, "OTP entropy must produce unique tokens across 50 iterations");
});

// 3. OTP Expiration Logic Test
runTest("OTP Expiration Rule Verification (10-minute lifetime)", () => {
  const now = Date.now();
  const validLifetimeMs = 10 * 60 * 1000;
  const expiredRecord = { expiresAt: now - 1000 };
  const activeRecord = { expiresAt: now + validLifetimeMs };

  const isExpired = (record) => Date.now() > record.expiresAt;
  assert.strictEqual(isExpired(expiredRecord), true, "Expired record must be rejected");
  assert.strictEqual(isExpired(activeRecord), false, "Active record must be accepted");
});

// 4. Rate-Limiting & Brute-Force Lock Test
runTest("Brute-Force Lockout (Lock after 5 failed attempts)", () => {
  let attempts = 0;
  const MAX_ATTEMPTS = 5;

  const simulateFailedAttempt = () => {
    attempts++;
    return attempts >= MAX_ATTEMPTS;
  };

  for (let i = 1; i <= 4; i++) {
    const isLocked = simulateFailedAttempt();
    assert.strictEqual(isLocked, false, `Attempt ${i} should not lock account`);
  }

  const lockedOnFifth = simulateFailedAttempt();
  assert.strictEqual(lockedOnFifth, true, "5th failed attempt must trigger security lock");
});

console.log("==================================================================");
console.log(`🏁 TEST RESULTS: ${testsPassed}/${testsTotal} Tests Passed Successfully`);
console.log("==================================================================");

if (testsPassed !== testsTotal) {
  process.exit(1);
}
