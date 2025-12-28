import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../../entities/user-profile.entity';
import { User } from '../../entities/user.entity';
import { CreateUserProfileDto, UpdateUserProfileDto } from '../../dto/user-profile.dto';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfilesRepository: Repository<UserProfile>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserProfileDto: CreateUserProfileDto): Promise<UserProfile> {
    // Verifica che l'utente esista
    const user = await this.usersRepository.findOne({
      where: { id: createUserProfileDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Utente con ID ${createUserProfileDto.userId} non trovato`,
      );
    }

    // Verifica che l'utente non abbia già un profilo (relazione 1:1)
    const existingProfile = await this.userProfilesRepository.findOne({
      where: { userId: createUserProfileDto.userId },
    });

    if (existingProfile) {
      throw new ConflictException(
        `L'utente con ID ${createUserProfileDto.userId} ha già un profilo`,
      );
    }

    const profile = this.userProfilesRepository.create(createUserProfileDto);
    return await this.userProfilesRepository.save(profile);
  }

  async findAll(): Promise<UserProfile[]> {
    return await this.userProfilesRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<UserProfile> {
    const profile = await this.userProfilesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profilo con ID ${id} non trovato`);
    }

    return profile;
  }

  async findByUserId(userId: number): Promise<UserProfile> {
    const profile = await this.userProfilesRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profilo per l'utente con ID ${userId} non trovato`);
    }

    return profile;
  }

  async update(id: number, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    const profile = await this.findOne(id);
    Object.assign(profile, updateUserProfileDto);
    return await this.userProfilesRepository.save(profile);
  }

  async remove(id: number): Promise<void> {
    const profile = await this.findOne(id);
    await this.userProfilesRepository.remove(profile);
  }
}
