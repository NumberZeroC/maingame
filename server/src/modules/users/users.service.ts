import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { CacheService } from '../../common/cache'

const USER_CACHE_TTL = 300 // 5 minutes
const USER_CACHE_PREFIX = 'user:'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cacheService: CacheService
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  async findOne(id: string): Promise<User | null> {
    const cacheKey = `${USER_CACHE_PREFIX}${id}`
    const cached = await this.cacheService.get<User>(cacheKey)
    if (cached) return cached

    const user = await this.usersRepository.findOne({ where: { id } })
    if (user) {
      await this.cacheService.set(cacheKey, user, USER_CACHE_TTL)
    }
    return user
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } })
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData)
    return this.usersRepository.save(user)
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, userData)
    await this.cacheService.del(`${USER_CACHE_PREFIX}${id}`)
    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    await this.cacheService.del(`${USER_CACHE_PREFIX}${id}`)
    await this.usersRepository.delete(id)
  }
}
