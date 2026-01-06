import { SetMetadata } from '@nestjs/common';

/**
 * Decorator per specificare i ruoli richiesti per un endpoint
 *
 * @example
 * @Roles('admin', 'teacher')
 * @Get()
 * async getCourses() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
