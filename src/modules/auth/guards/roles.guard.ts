import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from '../services/role.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard per verificare se l'utente ha i ruoli necessari
 *
 * Utilizzo:
 * 1. Applicare il decorator @Roles() al controller o al metodo
 * 2. Applicare @UseGuards(RolesGuard) al controller o al metodo
 *
 * @example
 * @UseGuards(RolesGuard)
 * @Roles('admin', 'teacher')
 * @Post()
 * async createCourse() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Ottiene i ruoli richiesti dai metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se non ci sono ruoli richiesti, consenti l'accesso
    if (!requiredRoles || requiredRoles.length === 0) {
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

    // Ottiene i ruoli dell'utente
    let userRoles;
    if (courseId) {
      userRoles = await this.roleService.getUserRolesInCourse(user.id, courseId);
    } else {
      userRoles = await this.roleService.getUserRoles(user.id);
    }

    // Verifica se l'utente ha almeno uno dei ruoli richiesti
    const hasRole = userRoles.some(role => requiredRoles.includes(role.name));

    if (!hasRole) {
      throw new ForbiddenException(`User does not have required role. Required: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
