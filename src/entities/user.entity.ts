import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from "typeorm";
import { Role } from "./role.entity";
import { Project } from "./project.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "timestamp", nullable: true })
  lastLogin: Date | null;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: "timestamp", nullable: true })
  lockedUntil: Date | null;

  @Column({ nullable: true })
  roleUuid: string | null;

  @Column()
  projectUuid: string;

  @ManyToOne(() => Role, (role) => role.users, { onDelete: "SET NULL" })
  role: Role;

  @ManyToOne(() => Project, (project) => project.users, { onDelete: "CASCADE" })
  project: Project;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deletedAt?: Date | null;
}
