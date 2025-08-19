const request = require('supertest');
const path = require('path');
const app = require(path.join(process.cwd(), 'src', 'index.js'));

describe('Auth Endpoints', () => {
  test('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('GET /api/test', async () => {
    const res = await request(app).get('/api/test');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('API çalışıyor!');
  });
});