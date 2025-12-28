import { SetMetadata } from "@nestjs/common";

export const ALLOW_NO_PERMISSION = "allowNoPermission";

export const AllowNoPermission = () => SetMetadata(ALLOW_NO_PERMISSION, true);

