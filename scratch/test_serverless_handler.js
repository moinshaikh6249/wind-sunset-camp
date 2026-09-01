import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import handler from '../backend/api/index.js';

async function testServerlessHandler() {
  console.log('Testing serverless handler import and invocation...');
  
  let responseStatus = null;
  let responseData = null;

  const req = {
    method: 'GET',
    url: '/api/camps',
    headers: {},
  };

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    send(data) {
      responseData = data;
      return this;
    },
    on() { return this; },
    setHeader() { return this; },
    end(data) {
      if (data) responseData = data;
      return this;
    }
  };

  try {
    await handler(req, res);
    console.log('Serverless execution completed successfully!');
    console.log('Status code:', responseStatus || 200);
    console.log('Response sample:', typeof responseData === 'object' ? JSON.stringify(responseData).slice(0, 150) : String(responseData).slice(0, 150));
    process.exit(0);
  } catch (err) {
    console.error('Serverless handler test failed:', err);
    process.exit(1);
  }
}

testServerlessHandler();
