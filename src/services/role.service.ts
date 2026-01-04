import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { UserRole } from '../entities/user-role.entity';
import { CourseUserRole } from '../entities/course-user-role.entity';
import { User } from '../entities/user.entity';
import { Course } from '../entities/course.entity';
import { CreateRoleDto, UpdateRoleDto, AssignRoleToUserDto, AssignCourseRoleDto } from '../dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(CourseUserRole)
    private courseUserRoleRepository: Repository<CourseUserRole>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  /**
   * Crea un nuovo ruolo
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name }
    });

    if (existingRole) {
      throw new ConflictException(`Role with name '${createRoleDto.name}' already exists`);
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      level: createRoleDto.level
    });

    // Se sono stati specificati permessi, li associa
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(createRoleDto.permissionIds)
      });

      if (permissions.length !== createRoleDto.permissionIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }

      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  /**
   * Trova tutti i ruoli
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { level: 'ASC' }
    });
  }

  /**
   * Trova un ruolo per ID
   */
  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions']
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  /**
   * Trova un ruolo per nome
   */
  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions']
    });

    if (!role) {
      throw new NotFoundException(`Role '${name}' not found`);
    }

    return role;
  }

  /**
   * Aggiorna un ruolo
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name }
      });

      if (existingRole) {
        throw new ConflictException(`Role with name '${updateRoleDto.name}' already exists`);
      }
    }

    // Aggiorna i campi base
    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined) role.description = updateRoleDto.description;
    if (updateRoleDto.level) role.level = updateRoleDto.level;

    // Aggiorna i permessi se specificati
    if (updateRoleDto.permissionIds !== undefined) {
      if (updateRoleDto.permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findBy({
          id: In(updateRoleDto.permissionIds)
        });

        if (permissions.length !== updateRoleDto.permissionIds.length) {
          throw new BadRequestException('One or more permission IDs are invalid');
        }

        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    return this.roleRepository.save(role);
  }

  /**
   * Elimina un ruolo
   */
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }

  /**
   * Assegna un ruolo a un utente
   */
  async assignRoleToUser(assignRoleDto: AssignRoleToUserDto, assignedById: number): Promise<UserRole> {
    // Verifica che il ruolo esista
    const role = await this.findOne(assignRoleDto.roleId);

    // Verifica che l'utente esista
    const user = await this.userRepository.findOne({
      where: { id: assignRoleDto.userId }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${assignRoleDto.userId} not found`);
    }

    // Verifica se l'utente ha già questo ruolo
    const existingUserRole = await this.userRoleRepository.findOne({
      where: {
        userId: assignRoleDto.userId,
        roleId: assignRoleDto.roleId
      }
    });

    if (existingUserRole) {
      throw new ConflictException(`User already has role '${role.name}'`);
    }

    // Crea l'associazione utente-ruolo
    const userRole = this.userRoleRepository.create({
      userId: assignRoleDto.userId,
      roleId: assignRoleDto.roleId,
      assignedBy: assignedById,
      expiresAt: assignRoleDto.expiresAt ? new Date(assignRoleDto.expiresAt) : null
    });

    return this.userRoleRepository.save(userRole);
  }

  /**
   * Rimuove un ruolo da un utente
   */
  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId }
    });

    if (!userRole) {
      throw new NotFoundException(`User does not have this role`);
    }

    await this.userRoleRepository.remove(userRole);
  }

  /**
   * Ottiene tutti i ruoli di un utente
   */
  async getUserRoles(userId: number): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role', 'role.permissions']
    });

    return userRoles
      .filter(ur => !ur.expiresAt || ur.expiresAt > new Date())
      .map(ur => ur.role);
  }

  /**
   * Assegna un ruolo specifico per un corso
   */
  async assignCourseRole(assignCourseRoleDto: AssignCourseRoleDto): Promise<CourseUserRole> {
    // Verifica che il corso esista
    const course = await this.courseRepository.findOne({
      where: { id: assignCourseRoleDto.courseId }
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${assignCourseRoleDto.courseId} not found`);
    }

    // Verifica che l'utente esista
    const user = await this.userRepository.findOne({
      where: { id: assignCourseRoleDto.userId }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${assignCourseRoleDto.userId} not found`);
    }

    // Verifica che il ruolo esista
    const role = await this.findOne(assignCourseRoleDto.roleId);

    // Verifica se esiste già questa associazione
    const existingCourseRole = await this.courseUserRoleRepository.findOne({
      where: {
        courseId: assignCourseRoleDto.courseId,
        userId: assignCourseRoleDto.userId,
        roleId: assignCourseRoleDto.roleId
      }
    });

    if (existingCourseRole) {
      throw new ConflictException(`User already has role '${role.name}' in this course`);
    }

    // Crea l'associazione
    const courseUserRole = this.courseUserRoleRepository.create(assignCourseRoleDto);
    return this.courseUserRoleRepository.save(courseUserRole);
  }

  /**
   * Rimuove un ruolo specifico di un corso
   */
  async removeCourseRole(courseId: number, userId: number, roleId: number): Promise<void> {
    const courseUserRole = await this.courseUserRoleRepository.findOne({
      where: { courseId, userId, roleId }
    });

    if (!courseUserRole) {
      throw new NotFoundException(`User does not have this role in this course`);
    }

    await this.courseUserRoleRepository.remove(courseUserRole);
  }

  /**
   * Ottiene tutti i ruoli di un utente per un corso specifico
   */
  async getUserRolesInCourse(userId: number, courseId: number): Promise<Role[]> {
    const courseUserRoles = await this.courseUserRoleRepository.find({
      where: { userId, courseId },
      relations: ['role', 'role.permissions']
    });

    return courseUserRoles.map(cur => cur.role);
  }

  /**
   * Verifica se un utente ha un permesso specifico
   */
  async userHasPermission(userId: number, permissionName: string, courseId?: number): Promise<boolean> {
    let roles: Role[];

    if (courseId) {
      // Controlla i permessi a livello di corso
      roles = await this.getUserRolesInCourse(userId, courseId);
    } else {
      // Controlla i permessi globali
      roles = await this.getUserRoles(userId);
    }

    // Verifica se almeno uno dei ruoli ha il permesso richiesto
    return roles.some(role =>
      role.permissions.some(permission => permission.name === permissionName)
    );
  }

  /**
   * Ottiene tutti i permessi di un utente (combinazione di tutti i suoi ruoli)
   */
  async getUserPermissions(userId: number, courseId?: number): Promise<Permission[]> {
    let roles: Role[];

    if (courseId) {
      roles = await this.getUserRolesInCourse(userId, courseId);
    } else {
      roles = await this.getUserRoles(userId);
    }

    // Combina tutti i permessi da tutti i ruoli (rimuovendo duplicati)
    const permissionsMap = new Map<number, Permission>();

    roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissionsMap.set(permission.id, permission);
      });
    });

    return Array.from(permissionsMap.values());
  }
}
