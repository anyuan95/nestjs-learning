import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class PermissionService {

  constructor(
    private dataSource: DataSource,
  ) {}

  create(createPermissionDto: CreatePermissionDto) {
    return 'This action adds a new permission';
  }

  findAll() {
    return `This action returns all permission`;
  }

  async findUserApis(userId: number) {
    const result = await this.dataSource
      .createQueryBuilder()
      .select([
        'pa.apiPath AS apiPath',
        'pa.method AS method',
      ])
      .from('user_roles', 'ur')
      .innerJoin('role_permissions', 'rp', 'ur.role_id = rp.role_id')
      .innerJoin('permission_apis', 'pa', 'rp.permission_id = pa.permissionId')
      .where('ur.user_id = :userId', { userId })
      .groupBy('pa.apiPath')
      .addGroupBy('pa.method')
      .getRawMany();
      const permissionApis = result.map(item => ({
        apiPath: item.apiPath,
        method: item.method,
      }));
      return permissionApis;
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
