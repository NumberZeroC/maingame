import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../src/modules/users/user.entity'
import { getModelToken } from '@nestjs/mongoose'
import { Game } from '../src/modules/games/game.schema'
import * as bcrypt from 'bcryptjs'

describe('Games E2E', () => {
  let app: INestApplication
  let userRepository: Repository<User>
  let accessToken: string

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

    const hashedPassword = await bcrypt.hash('password123', 10)
    const user = await userRepository.save({
      phone: '13800138000',
      password: hashedPassword,
      nickname: 'Test User',
    })

    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      phone: '13800138000',
      password: 'password123',
    })

    accessToken = loginResponse.body.accessToken
  })

  describe('/games (GET)', () => {
    it('should return games list', async () => {
      const response = await request(app.getHttpServer())
        .get('/games')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should return games with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/games')
        .query({ limit: 10, offset: 0 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/games').expect(401)
    })
  })

  describe('/games/:id (GET)', () => {
    it('should return game details', async () => {
      const gamesResponse = await request(app.getHttpServer())
        .get('/games')
        .set('Authorization', `Bearer ${accessToken}`)

      if (gamesResponse.body.length > 0) {
        const gameId = gamesResponse.body[0]._id || gamesResponse.body[0].id

        const response = await request(app.getHttpServer())
          .get(`/games/${gameId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)

        expect(response.body._id || response.body.id).toBe(gameId)
      }
    })

    it('should return 404 for non-existent game', async () => {
      await request(app.getHttpServer())
        .get('/games/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
    })

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/games/some-id').expect(401)
    })
  })

  describe('/games/:id/leaderboard (GET)', () => {
    it('should return leaderboard for game', async () => {
      const gamesResponse = await request(app.getHttpServer())
        .get('/games')
        .set('Authorization', `Bearer ${accessToken}`)

      if (gamesResponse.body.length > 0) {
        const gameId = gamesResponse.body[0]._id || gamesResponse.body[0].id

        const response = await request(app.getHttpServer())
          .get(`/games/${gameId}/leaderboard`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)

        expect(Array.isArray(response.body)).toBe(true)
      }
    })

    it('should limit leaderboard results', async () => {
      const gamesResponse = await request(app.getHttpServer())
        .get('/games')
        .set('Authorization', `Bearer ${accessToken}`)

      if (gamesResponse.body.length > 0) {
        const gameId = gamesResponse.body[0]._id || gamesResponse.body[0].id

        const response = await request(app.getHttpServer())
          .get(`/games/${gameId}/leaderboard`)
          .query({ limit: 5 })
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)

        expect(response.body.length).toBeLessThanOrEqual(5)
      }
    })
  })

  describe('/games (POST)', () => {
    it('should create a new game', async () => {
      const response = await request(app.getHttpServer())
        .post('/games')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Game',
          description: 'A test game',
          category: ['puzzle', 'ai'],
          version: '1.0.0',
          thumbnail: 'https://example.com/thumb.jpg',
          status: 'draft',
        })
        .expect(201)

      expect(response.body.name).toBe('Test Game')
      expect(response.body.description).toBe('A test game')
    })

    it('should fail with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/games')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '',
        })
        .expect(400)
    })

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/games')
        .send({
          name: 'Test Game',
        })
        .expect(401)
    })
  })

  describe('/games/:id (PUT)', () => {
    it('should update game', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/games')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Game',
          description: 'A test game',
          category: ['puzzle'],
          version: '1.0.0',
          thumbnail: 'https://example.com/thumb.jpg',
        })

      const gameId = createResponse.body._id || createResponse.body.id

      const response = await request(app.getHttpServer())
        .put(`/games/${gameId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Game Name',
        })
        .expect(200)

      expect(response.body.name).toBe('Updated Game Name')
    })

    it('should fail for non-existent game', async () => {
      await request(app.getHttpServer())
        .put('/games/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated',
        })
        .expect(404)
    })
  })

  describe('/games/:id (DELETE)', () => {
    it('should delete game', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/games')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Game',
          description: 'A test game',
          category: ['puzzle'],
          version: '1.0.0',
          thumbnail: 'https://example.com/thumb.jpg',
        })

      const gameId = createResponse.body._id || createResponse.body.id

      await request(app.getHttpServer())
        .delete(`/games/${gameId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      await request(app.getHttpServer())
        .get(`/games/${gameId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
    })
  })
})
