import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class GlobalMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.ncFullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    // console.log(req.ncFullUrl);
    next();
  }
}
