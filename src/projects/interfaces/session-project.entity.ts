import { UsersEntity } from "src/users/entities/users.entity";
import { ProjectEntity } from "../entities/project.entity";

export interface ISessionProject {
  joinedAt: Date;
  positionX: number;
  positionY: number;
  isActive: boolean;
  user: UsersEntity;
  project: ProjectEntity;
}