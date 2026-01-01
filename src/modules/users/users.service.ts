import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.usersRepository.create(createUserDto);
      return await this.usersRepository.save(user);
    } catch (error) {
      // Gestione errore duplicato (MySQL error code 1062 o ER_DUP_ENTRY)
      if (error instanceof QueryFailedError) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_DUP_ENTRY' || mysqlError.errno === 1062) {
          // Estrai il campo duplicato dal messaggio di errore
          const match = mysqlError.sqlMessage?.match(/Duplicate entry '(.+?)' for key '(.+?)'/);
          if (match) {
            const duplicateValue = match[1];
            const keyName = match[2];

            // Determina quale campo è duplicato
            if (keyName.includes('email') || keyName.includes('IDX_97672ac88f789774dd47f7c8be')) {
              throw new ConflictException(`Email "${duplicateValue}" già registrata`);
            } else if (keyName.includes('username')) {
              throw new ConflictException(`Username "${duplicateValue}" già in uso`);
            } else {
              throw new ConflictException('Utente già esistente con questi dati');
            }
          }
          throw new ConflictException('Utente già esistente');
        }
      }
      // Rilancia altri errori
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      relations: ['profile'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException(`Utente con ID ${id} non trovato`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
