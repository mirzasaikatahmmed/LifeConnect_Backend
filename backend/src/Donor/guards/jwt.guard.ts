import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const auth = req.headers['authorization'] as string | undefined;

        if (!auth || !auth.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }
        const token = auth.slice(7);

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
            req.user = payload; // attach decoded payload to request
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
