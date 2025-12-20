const request = require('supertest');
const app = require('../server');

describe('Basic API Tests', () => {
  test('Health check endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('status', 'healthy');
  });

  test('Root endpoint', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'SocialMedia Backend API is running');
  });

  test('404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'Route not found');
  });
});