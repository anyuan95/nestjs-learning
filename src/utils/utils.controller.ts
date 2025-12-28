import { Controller, Get } from '@nestjs/common';
import { AllowNoToken } from 'src/decorators/token.decorator';

@Controller()
export class UtilsController {

    @Get('/monitor/alive')
    @AllowNoToken()
    alive() {
        return {
            status: 'ok',
            message: 'Server is running',
        };
    }
}
