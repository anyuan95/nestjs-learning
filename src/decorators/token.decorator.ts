import { SetMetadata } from "@nestjs/common";

export const ALLOW_NO_TOKEN = "allowNoToken";

export const AllowNoToken = () => SetMetadata(ALLOW_NO_TOKEN, true);
