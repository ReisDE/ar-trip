import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/** Protege rotas de admin/motorista/guia. O cliente final não precisa disso nas rotas públicas. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não informado');
    }
    const token = authHeader.replace('Bearer ', '');
    request.usuario = this.authService.verificarToken(token);
    return true;
  }
}
