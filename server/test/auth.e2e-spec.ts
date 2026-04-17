import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../src/modules/users/user.entity'
import * as bcrypt from 'bcryptjs'

describe('Auth E2E', () => {
  let app: INestApplication
  let userRepository: Repository<User>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    )

    userRepository = moduleFixture.get(getRepositoryToken(User))

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await userRepository.clear()
  })

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: '13800138000',
          password: 'password123',
          nickname: 'Test User',
        })
        .expect(201)

      expect(response.body.accessToken).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()
      expect(response.body.user.phone).toBe('13800138000')
      expect(response.body.user.nickname).toBe('Test User')
    })

    it('should fail with duplicate phone number', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: '13800138000',
          password: 'password123',
          nickname: 'Test User',
        })
        .expect(201)

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: '13800138000',
          password: 'password456',
          nickname: 'Another User',
        })
        .expect(400)
    })

    it('should fail with invalid phone format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: 'invalid-phone',
          password: 'password123',
          nickname: 'Test User',
        })
        .expect(400)
    })

    it('should fail with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: '13800138000',
        })
        .expect(400)
    })

    it('should fail with short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: '13800138000',
          password: '123',
          nickname: 'Test User',
        })
        .expect(400)
    })
  })

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      await userRepository.save({
        phone: '13800138000',
        password: hashedPassword,
        nickname: 'Test User',
      })

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: '13800138000',
          password: 'password123',
        })
        .expect(201)

      expect(response.body.accessToken).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()
      expect(response.body.user.phone).toBe('13800138000')
    })

    it('should fail with invalid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      await userRepository.save({
        phone: '13800138000',
        password: hashedPassword,
        nickname: 'Test User',
      })

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: '13800138000',
          password: 'wrongpassword',
        })
        .expect(401)
    })

    it('should fail with non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: '99999999999',
          password: 'password123',
        })
        .expect(401)
    })

    it('should fail with missing fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: '13800138000',
        })
        .expect(400)
    })
  })

  describe('/auth/refresh (POST)', () => {
    it('should refresh token with valid refresh token', async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: '13800138000',
          password: 'password123',
          nickname: 'Test User',
        })
        .expect(201)

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: registerResponse.body.refreshToken,
        })
        .expect(201)

      expect(response.body.accessToken).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()
    })

    it('should fail with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401)
    })

    it('should fail with missing refresh token', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').send({}).expect(400)
    })
  })

  describe('/users/me (GET)', () => {
    it('should return current user with valid token', async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: '13800138000',
          password: 'password123',
          nickname: 'Test User',
        })
        .expect(201)

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
        .expect(200)

      expect(response.body.phone).toBe('13800138000')
      expect(response.body.nickname).toBe('Test User')
    })

    it('should fail without token', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401)
    })

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })

  describe('/users/me (PUT)', () => {
    it('should update user profile', async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: '13800138000',
          password: 'password123',
          nickname: 'Test User',
        })
        .expect(201)

      const response = await request(app.getHttpServer())
        .put('/users/me')
        .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
        .send({
          nickname: 'Updated Name',
        })
        .expect(200)

      expect(response.body.nickname).toBe('Updated Name')
    })

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .put('/users/me')
        .send({
          nickname: 'Updated Name',
        })
        .expect(401)
    })
  })
})
