import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../src/modules/auth/auth.service'
import { UsersService } from '../src/modules/users/users.service'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

jest.mock('bcryptjs')

describe('AuthService', () => {
  let authService: AuthService
  let usersService: jest.Mocked<UsersService>
  let jwtService: jest.Mocked<JwtService>

  const mockUser = {
    id: 'test-uuid',
    phone: '13800138000',
    password: 'hashedPassword',
    nickname: 'Test User',
    email: 'test@example.com',
    avatar: '',
    vipLevel: 0,
    coins: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const mockUsersService = {
      findByPhone: jest.fn(),
      create: jest.fn(),
    }

    const mockJwtService = {
      sign: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    usersService = module.get(UsersService)
    jwtService = module.get(JwtService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      usersService.findByPhone.mockResolvedValue(mockUser as any)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await authService.validateUser('13800138000', 'password123')

      expect(result).toEqual({
        id: mockUser.id,
        phone: mockUser.phone,
        nickname: mockUser.nickname,
        email: mockUser.email,
        avatar: mockUser.avatar,
        vipLevel: mockUser.vipLevel,
        coins: mockUser.coins,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      })
      expect(usersService.findByPhone).toHaveBeenCalledWith('13800138000')
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword')
    })

    it('should return null when user not found', async () => {
      usersService.findByPhone.mockResolvedValue(null)

      const result = await authService.validateUser('13800138000', 'password123')

      expect(result).toBeNull()
    })

    it('should return null when password is invalid', async () => {
      usersService.findByPhone.mockResolvedValue(mockUser as any)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const result = await authService.validateUser('13800138000', 'wrongpassword')

      expect(result).toBeNull()
    })
  })

  describe('login', () => {
    it('should return accessToken and user on successful login', async () => {
      const userWithoutPassword = { ...mockUser }
      delete (userWithoutPassword as any).password

      jest.spyOn(authService, 'validateUser').mockResolvedValue(userWithoutPassword)
      jwtService.sign.mockReturnValue('mock-jwt-token')

      const result = await authService.login('13800138000', 'password123')

      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        user: userWithoutPassword,
      })
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        phone: mockUser.phone,
      })
    })

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null)

      await expect(authService.login('13800138000', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException
      )
    })
  })

  describe('register', () => {
    it('should create user and return accessToken', async () => {
      const newUser = { ...mockUser, password: 'newHashedPassword' }
      usersService.create.mockResolvedValue(newUser as any)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword')
      jwtService.sign.mockReturnValue('mock-jwt-token')

      const result = await authService.register('13800138000', 'password123', 'New User')

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
      expect(usersService.create).toHaveBeenCalledWith({
        phone: '13800138000',
        password: 'newHashedPassword',
        nickname: 'New User',
      })
      expect(result.accessToken).toBe('mock-jwt-token')
    })
  })
})
