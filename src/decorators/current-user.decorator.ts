import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator per ottenere l'utente corrente dalla richiesta
 *
 * @example
 * @Get('profile')
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
