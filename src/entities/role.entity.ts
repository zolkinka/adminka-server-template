import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';

export enum RoleType {
  ADMIN = 'ADMIN',
  USER = 'USER',
  CLIENT = 'CLIENT',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  type: RoleType;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'simple-json', nullable: false })
  permissions: string[];

  @Column({ type: 'varchar', nullable: false })
  projectUuid: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Project, (project) => project.roles, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  project: Project;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}