import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class MockableGoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
      return true;
    }
    return super.canActivate(context);
  }
}

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and receive JWT access token' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new participant or organizer account' })
  @ApiResponse({ status: 201, description: 'Account registered successfully' })
  @ApiResponse({ status: 400, description: 'Email already registered or validation error' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Returns authenticated user profile details' })
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('google')
  @UseGuards(MockableGoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth Login' })
  async googleAuth(@Req() req: any, @Res() res: any) {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
      return res.redirect('/api/auth/google/callback');
    }
  }

  @Get('google/callback')
  @UseGuards(MockableGoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth Callback' })
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    let userProfile = req.user;
    
    // Mock user if bypass is active
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
      userProfile = {
        googleId: 'mock-google-id-12345',
        email: 'mockuser@gmail.com',
        firstName: 'Mock',
        lastName: 'User',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mock',
      };
    }

    const loginData = await this.authService.validateOAuthLogin(userProfile);
    res.redirect(`http://localhost:5173/auth/callback?token=${loginData.accessToken}`);
  }
}
