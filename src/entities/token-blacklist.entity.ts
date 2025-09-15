import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('token_blacklist')
export class TokenBlacklist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token_jti: string;

  @Column({ type: 'timestamp' })
  @Index()
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}