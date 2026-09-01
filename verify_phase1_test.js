import http from 'http';
import mongoose from 'mongoose';
import Camp from './backend/models/Camp.js';
import Booking from './backend/models/Booking.js';
import User from './backend/models/User.js';

function apiRequest(path, method = 'GET', token = null, body = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=============== PHASE 1 HTTP API VERIFICATION ===============\n');

  // Sign up a new user to get a user token
  const testEmail = `phase1_${Date.now()}@example.com`;
  const signupRes = await apiRequest('/auth/signup', 'POST', null, {
    firstName: 'Phase1Test',
    lastName: 'User',
    email: testEmail,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    phone: '9876543210',
  });

  const userToken = signupRes.body?.token;
  console.log(`User Signup: Status ${signupRes.status} | Token Received: ${!!userToken}`);

  if (!userToken) {
    console.log('Signup error:', signupRes.body);
    return;
  }

  // --- WSC-001 TESTS ---
  console.log('\n[WSC-001] Testing Authorization Middleware:');
  
  // 1. User accessing Admin endpoint -> Expected 403 Forbidden
  const userAccessRes = await apiRequest('/admin/reviews', 'GET', userToken);
  console.log(`- Case 1: User accessing /api/admin/reviews | Status: ${userAccessRes.status} (Expected: 403)`);

  // --- WSC-002 TESTS ---
  console.log('\n[WSC-002] Testing Booking Capacity Enforcement:');

  const campsRes = await apiRequest('/camps');
  const camps = campsRes.body?.camps || campsRes.body?.data || [];
  
  if (camps.length === 0) {
    console.log('No camps found.');
    return;
  }

  const activeCamp = camps[0];
  const campId = activeCamp._id || activeCamp.id;

  // Case 1: Guest count 0 -> Expected 400
  const resCount0 = await apiRequest('/bookings', 'POST', userToken, {
    fullName: 'Phase1 Test User',
    email: testEmail,
    phone: '9876543210',
    campId,
    numberOfPeople: 0,
  });
  console.log(`- Case 4: Invalid Guest Count (0) | Status: ${resCount0.status} | Message: "${resCount0.body?.message || resCount0.body?.errors?.join(', ')}"`);

  // Connect to DB and set test camp capacity = 10
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://moin:moin123456789@ac-q81c7aj-shard-00-00.mnp7uxu.mongodb.net:27017,ac-q81c7aj-shard-00-01.mnp7uxu.mongodb.net:27017,ac-q81c7aj-shard-00-02.mnp7uxu.mongodb.net:27017/windcamp?ssl=true&replicaSet=atlas-jkyoh4-shard-0&authSource=admin&retryWrites=true&w=majority';
  await mongoose.connect(mongoURI);

  const targetCampDoc = await Camp.findById(campId);
  const originalCapacity = targetCampDoc.capacity;

  targetCampDoc.capacity = 10;
  await targetCampDoc.save();

  console.log(`Updated Camp "${targetCampDoc.name}" capacity to 10 for testing.`);

  // Case 2: Excessive guest count exceeding capacity (9999) -> Expected 400 Bad Request!
  const resExceed = await apiRequest('/bookings', 'POST', userToken, {
    fullName: 'Phase1 Test User',
    email: testEmail,
    phone: '9876543210',
    campId,
    numberOfPeople: 9999,
  });
  console.log(`- Case 2: Guest Count 9999 (Exceeds capacity 10) | Status: ${resExceed.status} | Message: "${resExceed.body?.message}"`);

  // Case 3: Valid guest count (1) -> Expected 201 Created
  const resValid = await apiRequest('/bookings', 'POST', userToken, {
    fullName: 'Phase1 Test User',
    email: testEmail,
    phone: '9876543210',
    campId,
    numberOfPeople: 1,
  });
  console.log(`- Case 1: Valid Guest Count (1) | Status: ${resValid.status} | Message: "${resValid.body?.message}"`);

  // Restore original capacity and clean up test booking & user
  targetCampDoc.capacity = originalCapacity;
  await targetCampDoc.save();

  if (resValid.body?.booking?._id) {
    await Booking.findByIdAndDelete(resValid.body.booking._id);
  }
  await User.deleteOne({ email: testEmail });

  await mongoose.disconnect();
  console.log('Restored original capacity and cleaned up test data.');

  const wsc001Passed = userAccessRes.status === 403;
  const wsc002Passed = resCount0.status === 400 && resExceed.status === 400 && resValid.status === 201;

  console.log('\n=============================================================');
  console.log(`WSC-001 STATUS: ${wsc001Passed ? 'PASS' : 'FAIL'}`);
  console.log(`WSC-002 STATUS: ${wsc002Passed ? 'PASS' : 'FAIL'}`);
  console.log('=============================================================');
}

runTests().catch((err) => {
  console.error('Error running test:', err);
});
