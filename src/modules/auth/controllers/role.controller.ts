import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleToUserDto, AssignCourseRoleDto } from '../dto/role.dto';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { CourseUserRole } from '../entities/course-user-role.entity';
import { Permission } from '../entities/permission.entity';
import { Permissions } from '../decorators/permissions.decorator';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RolesGuard } from '../guards/roles.guard';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('manage_roles')
  @ApiOperation({ summary: 'Crea un nuovo ruolo' })
  @ApiResponse({ status: 201, description: 'Ruolo creato con successo' })
  @ApiResponse({ status: 409, description: 'Ruolo già esistente' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ottieni tutti i ruoli' })
  @ApiResponse({ status: 200, description: 'Lista di tutti i ruoli' })
  async findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un ruolo per ID' })
  @ApiResponse({ status: 200, description: 'Ruolo trovato' })
  @ApiResponse({ status: 404, description: 'Ruolo non trovato' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.roleService.findOne(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Ottieni un ruolo per nome' })
  @ApiResponse({ status: 200, description: 'Ruolo trovato' })
  @ApiResponse({ status: 404, description: 'Ruolo non trovato' })
  async findByName(@Param('name') name: string): Promise<Role> {
    return this.roleService.findByName(name);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_roles')
  @ApiOperation({ summary: 'Aggiorna un ruolo' })
  @ApiResponse({ status: 200, description: 'Ruolo aggiornato con successo' })
  @ApiResponse({ status: 404, description: 'Ruolo non trovato' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_roles')
  @ApiOperation({ summary: 'Elimina un ruolo' })
  @ApiResponse({ status: 200, description: 'Ruolo eliminato con successo' })
  @ApiResponse({ status: 404, description: 'Ruolo non trovato' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.roleService.remove(id);
    return { message: 'Role deleted successfully' };
  }

  // === Gestione assegnazione ruoli agli utenti ===

  @Post('assign')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_users')
  @ApiOperation({ summary: 'Assegna un ruolo a un utente' })
  @ApiResponse({ status: 201, description: 'Ruolo assegnato con successo' })
  @ApiResponse({ status: 404, description: 'Utente o ruolo non trovato' })
  @ApiResponse({ status: 409, description: 'L\'utente ha già questo ruolo' })
  async assignToUser(
    @Body() assignRoleDto: AssignRoleToUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserRole> {
    return this.roleService.assignRoleToUser(assignRoleDto, currentUser.id);
  }

  @Delete('user/:userId/role/:roleId')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_users')
  @ApiOperation({ summary: 'Rimuovi un ruolo da un utente' })
  @ApiResponse({ status: 200, description: 'Ruolo rimosso con successo' })
  @ApiResponse({ status: 404, description: 'Associazione non trovata' })
  async removeFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<{ message: string }> {
    await this.roleService.removeRoleFromUser(userId, roleId);
    return { message: 'Role removed from user successfully' };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Ottieni tutti i ruoli di un utente' })
  @ApiResponse({ status: 200, description: 'Lista dei ruoli dell\'utente' })
  async getUserRoles(@Param('userId', ParseIntPipe) userId: number): Promise<Role[]> {
    return this.roleService.getUserRoles(userId);
  }

  @Get('user/:userId/permissions')
  @ApiOperation({ summary: 'Ottieni tutti i permessi di un utente' })
  @ApiResponse({ status: 200, description: 'Lista dei permessi dell\'utente' })
  async getUserPermissions(@Param('userId', ParseIntPipe) userId: number): Promise<Permission[]> {
    return this.roleService.getUserPermissions(userId);
  }

  // === Gestione ruoli per corso ===

  @Post('course/assign')
  @UseGuards(PermissionsGuard)
  @Permissions('enroll_students')
  @ApiOperation({ summary: 'Assegna un ruolo a un utente per un corso specifico' })
  @ApiResponse({ status: 201, description: 'Ruolo per corso assegnato con successo' })
  @ApiResponse({ status: 404, description: 'Corso, utente o ruolo non trovato' })
  @ApiResponse({ status: 409, description: 'L\'utente ha già questo ruolo in questo corso' })
  async assignCourseRole(@Body() assignCourseRoleDto: AssignCourseRoleDto): Promise<CourseUserRole> {
    return this.roleService.assignCourseRole(assignCourseRoleDto);
  }

  @Delete('course/:courseId/user/:userId/role/:roleId')
  @UseGuards(PermissionsGuard)
  @Permissions('enroll_students')
  @ApiOperation({ summary: 'Rimuovi un ruolo di un utente da un corso' })
  @ApiResponse({ status: 200, description: 'Ruolo per corso rimosso con successo' })
  @ApiResponse({ status: 404, description: 'Associazione non trovata' })
  async removeCourseRole(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<{ message: string }> {
    await this.roleService.removeCourseRole(courseId, userId, roleId);
    return { message: 'Course role removed successfully' };
  }

  @Get('course/:courseId/user/:userId')
  @ApiOperation({ summary: 'Ottieni i ruoli di un utente in un corso specifico' })
  @ApiResponse({ status: 200, description: 'Lista dei ruoli dell\'utente nel corso' })
  async getUserRolesInCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Role[]> {
    return this.roleService.getUserRolesInCourse(userId, courseId);
  }

  @Get('course/:courseId/user/:userId/permissions')
  @ApiOperation({ summary: 'Ottieni i permessi di un utente in un corso specifico' })
  @ApiResponse({ status: 200, description: 'Lista dei permessi dell\'utente nel corso' })
  async getUserPermissionsInCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Permission[]> {
    return this.roleService.getUserPermissions(userId, courseId);
  }
}
