import { Entity, OneToMany } from 'typeorm';
import { Column } from 'typeorm/decorator/columns/Column';
import { Exclude } from 'class-transformer';

import { BaseEntity } from 'src/common/entities/base.entity';
import { IUser } from '../interfaces/user.interface';
import { GENDERS } from 'src/common/constants/configuracion';
import { MemberProjectEntity } from 'src/projects/entities/member-project.entity';
import { ProjectEntity } from 'src/projects/entities/project.entity';

@Entity({ name: 'user' })
export class UsersEntity extends BaseEntity implements IUser {
  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  last_name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'enum', enum: GENDERS, nullable: true })
  gender: GENDERS;

  @Column({ type: 'bool', default: false })
  isSuspended: boolean;

  @OneToMany(() => MemberProjectEntity, (memberProject) => memberProject.user)
  projects: MemberProjectEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.user)
  projectsCreated: ProjectEntity[];
}
