import request from 'supertest';
import app from '../src/app';

/**
 * Test suite for the root route of the StockTrack API.
 * Verifies the behavior of the root endpoint, which is expected to return a welcome message.
 */
describe('App root route', () => {
  
  /**
   * Test for the root route ('/').
   * Ensures that the API responds with a status code of 200 and the expected welcome message.
   * 
   * Expected response:
   * - Status Code: 200 (OK)
   * - Text: 'Welcome to StockTrack API'
   */
  it('should return welcome message', async () => {
    const res = await request(app).get('/');

    // Check that the status code is 200 (OK)
    expect(res.statusCode).toBe(200);
    
    // Check that the response text matches the expected welcome message
    expect(res.text).toBe('Welcome to StockTrack API');
  });
});