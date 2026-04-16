import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '../src/modules/users/users.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../src/modules/users/user.entity'
import { CacheService } from '../src/common/cache'

describe('UsersService', () => {
  let service: UsersService
  let repository: jest.Mocked<Repository<User>>
  let cacheService: jest.Mocked<CacheService>

  const mockUser: User = {
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
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    repository = module.get(getRepositoryToken(User))
    cacheService = module.get(CacheService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('should return an array of users', async () => {
      repository.find.mockResolvedValue([mockUser])

      const result = await service.findAll()

      expect(result).toEqual([mockUser])
      expect(repository.find).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return cached user if available', async () => {
      cacheService.get.mockResolvedValue(mockUser)

      const result = await service.findOne('test-uuid')

      expect(result).toEqual(mockUser)
      expect(cacheService.get).toHaveBeenCalledWith('user:test-uuid')
      expect(repository.findOne).not.toHaveBeenCalled()
    })

    it('should return user from database and cache it', async () => {
      cacheService.get.mockResolvedValue(null)
      repository.findOne.mockResolvedValue(mockUser)

      const result = await service.findOne('test-uuid')

      expect(result).toEqual(mockUser)
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-uuid' } })
      expect(cacheService.set).toHaveBeenCalledWith('user:test-uuid', mockUser, 300)
    })

    it('should return null when user not found', async () => {
      cacheService.get.mockResolvedValue(null)
      repository.findOne.mockResolvedValue(null)

      const result = await service.findOne('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findByPhone', () => {
    it('should return user by phone', async () => {
      repository.findOne.mockResolvedValue(mockUser)

      const result = await service.findByPhone('13800138000')

      expect(result).toEqual(mockUser)
      expect(repository.findOne).toHaveBeenCalledWith({ where: { phone: '13800138000' } })
    })

    it('should return null when phone not found', async () => {
      repository.findOne.mockResolvedValue(null)

      const result = await service.findByPhone('99999999999')

      expect(result).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      repository.findOne.mockResolvedValue(mockUser)

      const result = await service.findByEmail('test@example.com')

      expect(result).toEqual(mockUser)
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } })
    })
  })

  describe('create', () => {
    it('should create and return a new user', async () => {
      const userData = { phone: '13800138000', password: 'hashed', nickname: 'New User' }
      repository.create.mockReturnValue(mockUser)
      repository.save.mockResolvedValue(mockUser)

      const result = await service.create(userData)

      expect(result).toEqual(mockUser)
      expect(repository.create).toHaveBeenCalledWith(userData)
      expect(repository.save).toHaveBeenCalledWith(mockUser)
    })
  })

  describe('update', () => {
    it('should update user and clear cache', async () => {
      const updateData = { nickname: 'Updated Name' }
      const updatedUser = { ...mockUser, nickname: 'Updated Name' }

      repository.update.mockResolvedValue(undefined as any)
      cacheService.get.mockResolvedValue(null)
      repository.findOne.mockResolvedValue(updatedUser)

      const result = await service.update('test-uuid', updateData)

      expect(repository.update).toHaveBeenCalledWith('test-uuid', updateData)
      expect(cacheService.del).toHaveBeenCalledWith('user:test-uuid')
      expect(result).toEqual(updatedUser)
    })
  })

  describe('remove', () => {
    it('should delete user and clear cache', async () => {
      await service.remove('test-uuid')

      expect(cacheService.del).toHaveBeenCalledWith('user:test-uuid')
      expect(repository.delete).toHaveBeenCalledWith('test-uuid')
    })
  })
})
