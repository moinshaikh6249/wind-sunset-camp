import http from 'http';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- STARTING VERIFICATION ---');

  // 1. Site Webmanifest
  try {
    const manifest = await fetchUrl('http://localhost:3000/site.webmanifest');
    console.log(`[MANIFEST] /site.webmanifest -> Status ${manifest.statusCode}`);
    if (manifest.statusCode === 200 && manifest.data.includes('Wind & Sunset Camp')) {
      console.log('[MANIFEST] PASS: Valid webmanifest JSON returned with 200 OK');
    } else {
      console.log('[MANIFEST] FAIL:', manifest.data);
    }
  } catch (err) {
    console.log('[MANIFEST] ERROR:', err.message);
  }

  // 2. Express Backend API /api/camps
  try {
    const camps = await fetchUrl('http://localhost:5000/api/camps');
    console.log(`[BACKEND API] /api/camps -> Status ${camps.statusCode}`);
    if (camps.statusCode === 200) {
      console.log('[BACKEND API] PASS: /api/camps healthy');
    }
  } catch (err) {
    console.log('[BACKEND API] ERROR:', err.message);
  }

  // 3. Express Backend API /api/memories
  try {
    const memories = await fetchUrl('http://localhost:5000/api/memories');
    console.log(`[BACKEND API] /api/memories -> Status ${memories.statusCode}`);
    if (memories.statusCode === 200) {
      console.log('[BACKEND API] PASS: /api/memories healthy');
    }
  } catch (err) {
    console.log('[BACKEND API] ERROR:', err.message);
  }

  // 4. Homepage HTML Check
  try {
    const home = await fetchUrl('http://localhost:3000/');
    console.log(`[HOMEPAGE] http://localhost:3000 -> Status ${home.statusCode}`);
    const isVisible = home.data.includes('Escape the City') || home.data.includes('Wind & Sunset');
    const hasHeroVideo = home.data.includes('light-hero.mp4.mp4') && home.data.includes('dark-hero.mp4.mp4');
    console.log(`[HOMEPAGE] Rendered HTML contains content: ${isVisible ? 'PASS' : 'FAIL'}`);
    console.log(`[HOMEPAGE] Light and Dark Hero Videos present in HTML: ${hasHeroVideo ? 'PASS' : 'FAIL'}`);
  } catch (err) {
    console.log('[HOMEPAGE] ERROR:', err.message);
  }

  console.log('--- VERIFICATION COMPLETE ---');
}

run();
