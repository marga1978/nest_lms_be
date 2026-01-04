import { SetMetadata } from '@nestjs/common';

/**
 * Decorator per specificare i permessi richiesti per un endpoint
 *
 * @example
 * @Permissions('create_courses', 'edit_courses')
 * @Get()
 * async getCourses() { ... }
 */
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
