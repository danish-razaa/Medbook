const bcrypt = require('bcryptjs');
const authService = require('../../src/services/auth.service');
const userRepo = require('../../src/repositories/user.repository');

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

describe('Auth Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should throw 409 if email already exists', async () => {
      userRepo.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com' });
      await expect(authService.register({ name: 'Test', email: 'test@test.com', password: 'pass12345' }))
        .rejects.toMatchObject({ statusCode: 409 });
    });

    it('should register and return tokens', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue({ id: '1', name: 'Test', email: 'test@test.com', role: 'CUSTOMER' });
      userRepo.updateRefreshToken.mockResolvedValue();

      const result = await authService.register({ name: 'Test', email: 'test@test.com', password: 'pass12345', role: 'CUSTOMER' });
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('login', () => {
    it('should throw 401 for non-existent user', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      await expect(authService.login({ email: 'x@x.com', password: 'pass' }))
        .rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 for wrong password', async () => {
      userRepo.findByEmail.mockResolvedValue({
        id: '1', email: 'test@test.com', password: await bcrypt.hash('correct', 12), is_active: true, role: 'CUSTOMER',
      });
      await expect(authService.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toMatchObject({ statusCode: 401 });
    });

    it('should return tokens on successful login', async () => {
      const hashedPw = await bcrypt.hash('correct123', 12);
      userRepo.findByEmail.mockResolvedValue({ id: '1', name: 'Test', email: 'test@test.com', password: hashedPw, is_active: true, role: 'CUSTOMER' });
      userRepo.updateRefreshToken.mockResolvedValue();

      const result = await authService.login({ email: 'test@test.com', password: 'correct123' });
      expect(result).toHaveProperty('token');
    });
  });
});
