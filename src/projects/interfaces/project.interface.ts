import { UsersEntity } from "src/users/entities/users.entity";

export interface IProject {
  name: string;
  data: string
  user: UsersEntity
}