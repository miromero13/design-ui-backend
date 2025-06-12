import { Column, Entity, ManyToOne } from "typeorm";
import { IMemberProject } from "../interfaces/member-project.interface";
import { ProjectEntity } from "./project.entity";
import { UsersEntity } from "src/users/entities/users.entity";
import { BaseEntity } from "src/common/entities/base.entity";

@Entity({ name: 'member_project' })
export class MemberProjectEntity extends BaseEntity implements IMemberProject {
  @Column({ name: 'role', type: 'varchar', length: 50 })
  role: string;

  @Column({ name: 'invited_at', type: 'timestamp' })
  invitedAt: Date;

  @Column({ name: 'accepted_at', type: 'timestamp' })
  acceptedAt: Date;

  @ManyToOne(() => ProjectEntity, (project) => project.members)
  project: ProjectEntity;

  @ManyToOne(() => UsersEntity, (user) => user.projects)
  user: UsersEntity;
}