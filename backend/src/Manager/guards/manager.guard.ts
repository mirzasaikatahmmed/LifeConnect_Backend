import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class ManagerGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Unauthorized access. Manager privileges required.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;

      // Check if user has manager role - শুধুমাত্র manager access দিবে
      if (payload.role !== 'manager' && payload.userType !== 'manager') {
        throw new UnauthorizedException(
          'Unauthorized access. Manager privileges required.',
        );
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        'Unauthorized access. Manager privileges required.',
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
