import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/permission.dto';
import { Permission } from '../entities/permission.entity';
import { Permissions } from '../decorators/permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('manage_roles')
  @ApiOperation({ summary: 'Crea un nuovo permesso' })
  @ApiResponse({ status: 201, description: 'Permesso creato con successo' })
  @ApiResponse({ status: 409, description: 'Permesso già esistente' })
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ottieni tutti i permessi' })
  @ApiResponse({ status: 200, description: 'Lista di tutti i permessi' })
  async findAll(): Promise<Permission[]> {
    return this.permissionService.findAll();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Ottieni permessi per categoria' })
  @ApiResponse({ status: 200, description: 'Lista dei permessi della categoria' })
  async findByCategory(@Param('category') category: string): Promise<Permission[]> {
    return this.permissionService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un permesso per ID' })
  @ApiResponse({ status: 200, description: 'Permesso trovato' })
  @ApiResponse({ status: 404, description: 'Permesso non trovato' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Permission> {
    return this.permissionService.findOne(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Ottieni un permesso per nome' })
  @ApiResponse({ status: 200, description: 'Permesso trovato' })
  @ApiResponse({ status: 404, description: 'Permesso non trovato' })
  async findByName(@Param('name') name: string): Promise<Permission> {
    return this.permissionService.findByName(name);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_roles')
  @ApiOperation({ summary: 'Aggiorna un permesso' })
  @ApiResponse({ status: 200, description: 'Permesso aggiornato con successo' })
  @ApiResponse({ status: 404, description: 'Permesso non trovato' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_roles')
  @ApiOperation({ summary: 'Elimina un permesso' })
  @ApiResponse({ status: 200, description: 'Permesso eliminato con successo' })
  @ApiResponse({ status: 404, description: 'Permesso non trovato' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.permissionService.remove(id);
    return { message: 'Permission deleted successfully' };
  }
}
