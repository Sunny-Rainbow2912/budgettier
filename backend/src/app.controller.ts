import { Controller, Get, Res, Req, Next } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api/health')
  getHealth() {
    return this.appService.getHealth();
  }

  // Catch-all route for SPA - must be last
  // This handles client-side routing (e.g., /organization, /about)
  @Get('*')
  serveFrontend(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const path = req.path;

    // Don't intercept API routes, static assets, or departments
    if (
      path.startsWith('/api') ||
      path.startsWith('/departments') ||
      path.startsWith('/assets') ||
      path.includes('.')
    ) {
      // Pass to next handler (ServeStaticModule)
      return next();
    }

    // Serve index.html for all other routes (SPA client-side routing)
    const indexPath = join(
      __dirname,
      '..',
      '..',
      'frontend',
      'dist',
      'index.html',
    );
    return res.sendFile(indexPath);
  }
}
