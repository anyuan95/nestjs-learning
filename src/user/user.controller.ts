import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseBoolPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/api/user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('/api/user')
  findAll(@Query('force', new ParseBoolPipe({ optional: true })) force?: boolean) {
    // console.log(force);
    // console.log(force === true);
    // console.log(force === false);
    // console.log(typeof force);
    return this.userService.findAll();
  }

  @Get('/api/user/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch('/api/user/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete('/api/user/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
