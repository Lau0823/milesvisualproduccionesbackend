import { Controller, Post, Body, HttpCode, HttpStatus, Res, Get, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { Request, type Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Interfaz para el usuario en la solicitud
interface RequestWithUser extends Request {
  user: {
    id: number;
    username: string;
    rol: string;
    cliente_id?: number | null;
  };
}

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() 
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia sesión de un usuario con nombre de usuario y contraseña (Ruta pública)' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso. El token JWT se establece como una cookie HttpOnly.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken } = await this.authService.login(loginUserDto); 

    res.cookie('jwt', accessToken, {
      httpOnly: true, 
      secure: true, 
      sameSite: 'none', 
      maxAge: 86400000, 
      path: '/', 
    });
    return { message: 'Inicio de sesión exitoso', user, token: accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard) 
  @HttpCode(HttpStatus.NO_CONTENT) 
  @ApiOperation({ summary: 'Cierra la sesión del usuario eliminando la cookie JWT' })
  @ApiResponse({ status: 204, description: 'Sesión cerrada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return; 
  }

  @Get('check-session')
  @UseGuards(JwtAuthGuard) 
  @ApiOperation({ summary: 'Verifica la sesión actual del usuario' })
  @ApiResponse({ status: 200, description: 'Sesión activa.', type: Object })
  @ApiResponse({ status: 401, description: 'Sesión inactiva o inválida.' })
  checkSession(@Req() req: RequestWithUser) {
    return { 
      message: 'Sesión activa', 
      user: {
        id: req.user.id,
        username: req.user.username,
        rol: req.user.rol,
        cliente_id: req.user.cliente_id 
      }
    };
  }
}