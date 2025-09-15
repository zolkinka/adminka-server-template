import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@/entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findOne(uuid: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { uuid } });
    if (!role) {
      throw new NotFoundException(`Role with UUID ${uuid} not found`);
    }
    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async update(uuid: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(uuid);
    const updatedRole = this.rolesRepository.merge(role, updateRoleDto);
    return this.rolesRepository.save(updatedRole);
  }

  async remove(uuid: string): Promise<void> {
    const role = await this.findOne(uuid);
    await this.rolesRepository.softDelete(uuid);
  }
}