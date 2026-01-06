import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Crea un nuovo permesso
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name }
    });

    if (existingPermission) {
      throw new ConflictException(`Permission with name '${createPermissionDto.name}' already exists`);
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  /**
   * Trova tutti i permessi
   */
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { category: 'ASC', name: 'ASC' }
    });
  }

  /**
   * Trova permessi per categoria
   */
  async findByCategory(category: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { category },
      order: { name: 'ASC' }
    });
  }

  /**
   * Trova un permesso per ID
   */
  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id }
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  /**
   * Trova un permesso per nome
   */
  async findByName(name: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { name }
    });

    if (!permission) {
      throw new NotFoundException(`Permission '${name}' not found`);
    }

    return permission;
  }

  /**
   * Aggiorna un permesso
   */
  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: updatePermissionDto.name }
      });

      if (existingPermission) {
        throw new ConflictException(`Permission with name '${updatePermissionDto.name}' already exists`);
      }
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  /**
   * Elimina un permesso
   */
  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }
}
