const request = require('supertest');
const app = require('../src/index');
const mongoose = require('mongoose');

describe('Companies API', () => {
  let authToken;
  let testCompanyId;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpass123'
      });
    
    if (loginResponse.status === 200) {
      authToken = loginResponse.body.token;
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/companies', () => {
    test('should return companies list with pagination', async () => {
      const response = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('companies');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    test('should filter companies by search term', async () => {
      const response = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'test' });

      expect(response.status).toBe(200);
    });

    test('should filter companies by sector', async () => {
      const response = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ sector: 'Teknoloji' });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/companies', () => {
    test('should create new company', async () => {
      const companyData = {
        companyName: 'Test Company',
        contactPerson: 'Test Person',
        email: 'test@company.com',
        phone: '+905551234567',
        address: 'Test Address',
        sector: 'Teknoloji',
        status: 'active',
        notes: 'Test company for testing'
      };

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('company');
      expect(response.body.company.companyName).toBe(companyData.companyName);
      
      testCompanyId = response.body.company._id;
    });

    test('should return error for duplicate company name', async () => {
      const companyData = {
        companyName: 'Test Company',
        contactPerson: 'Test Person 2',
        email: 'test2@company.com',
        phone: '+905551234568',
        address: 'Test Address 2',
        sector: 'Teknoloji'
      };

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('zaten kullanılıyor');
    });
  });

  describe('GET /api/companies/:id', () => {
    test('should return company by ID', async () => {
      if (!testCompanyId) {
        testCompanyId = '507f1f77bcf86cd799439011'; // Fallback test ID
      }

      const response = await request(app)
        .get(`/api/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('company');
    });

    test('should return 404 for non-existent company', async () => {
      const response = await request(app)
        .get('/api/companies/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/companies/:id', () => {
    test('should update company', async () => {
      if (!testCompanyId) {
        testCompanyId = '507f1f77bcf86cd799439011'; // Fallback test ID
      }

      const updateData = {
        contactPerson: 'Updated Person',
        notes: 'Updated notes'
      };

      const response = await request(app)
        .put(`/api/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.company.contactPerson).toBe(updateData.contactPerson);
    });
  });

  describe('GET /api/companies/stats', () => {
    test('should return company statistics', async () => {
      const response = await request(app)
        .get('/api/companies/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCompanies');
      expect(response.body).toHaveProperty('activeCompanies');
      expect(response.body).toHaveProperty('sectorStats');
    });
  });

  describe('GET /api/companies/sector/:sector', () => {
    test('should return companies by sector', async () => {
      const response = await request(app)
        .get('/api/companies/sector/Teknoloji')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('companies');
    });
  });
});
