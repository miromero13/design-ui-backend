import { BaseEntity } from "src/common/entities/base.entity";
import { IProject } from "../interfaces/project.interface";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { MemberProjectEntity } from "./member-project.entity";
import { UsersEntity } from "src/users/entities/users.entity";

@Entity({name: 'project'})
export class ProjectEntity extends BaseEntity implements IProject {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'data', type: 'json' })
  data: string;

  @OneToMany(() => MemberProjectEntity, (memberProject) => memberProject.project)
  members: MemberProjectEntity[];

  @ManyToOne(() => UsersEntity, (user) => user.projectsCreated)
  user: UsersEntity;
}
