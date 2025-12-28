import { Body, Controller, Get, Injectable, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/api/v1/auth/login')
    @UseGuards(LocalAuthGuard)
    async login(@Req() req) {
        return this.authService.login(req.user);
    }

    @Get('/api/v1/auth/me')
    @UseGuards(JwtAuthGuard)
    async me(@Req() req) {
        return req.user;
    }

}