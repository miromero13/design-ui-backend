import { UsersEntity } from "src/users/entities/users.entity";
import { ProjectEntity } from "../entities/project.entity";

export interface IMemberProject {
  role: string;
  invitedAt: Date;
  acceptedAt: Date;
  project: ProjectEntity; 
  user: UsersEntity;
}