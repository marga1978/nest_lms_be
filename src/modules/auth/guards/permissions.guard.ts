import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from '../services/role.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * Guard per verificare se l'utente ha i permessi necessari
 *
 * Utilizzo:
 * 1. Applicare il decorator @Permissions() al controller o al metodo
 * 2. Applicare @UseGuards(PermissionsGuard) al controller o al metodo
 *
 * @example
 * @UseGuards(PermissionsGuard)
 * @Permissions('create_courses')
 * @Post()
 * async createCourse() { ... }
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Ottiene i permessi richiesti dai metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se non ci sono permessi richiesti, consenti l'accesso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Ottiene l'utente dalla richiesta
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Ottiene il courseId se presente nei parametri
    const courseId = request.params.courseId ? parseInt(request.params.courseId) : undefined;

    // Verifica se l'utente ha tutti i permessi richiesti
    for (const permission of requiredPermissions) {
      const hasPermission = await this.roleService.userHasPermission(user.id, permission, courseId);

      if (!hasPermission) {
        throw new ForbiddenException(`User does not have permission: ${permission}`);
      }
    }

    return true;
  }
}
