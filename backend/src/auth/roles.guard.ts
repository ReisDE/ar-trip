import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Roda depois do AuthGuard (que já preencheu request.usuario a partir do JWT).
 * Confere se o tipo do usuário está entre os papéis exigidos pela rota.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const papeisExigidos = this.reflector.get<string[]>('papeis', context.getHandler());
    if (!papeisExigidos || papeisExigidos.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const usuario = request.usuario as { tipo: string } | undefined;
    if (!usuario || !papeisExigidos.includes(usuario.tipo)) {
      throw new ForbiddenException('Você não tem permissão pra acessar isso');
    }
    return true;
  }
}
