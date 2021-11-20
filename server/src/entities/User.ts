import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Post } from "./Post";
import {Updoot} from "./Updoot";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(_return => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(_return => String)
  @Column({unique: true})
  username!: string;

  @Column({type: "text"})
  password!: string;

  @Field(_return => String)
  @Column({unique: true})
  email!: string;

  @OneToMany(_return => Post, (post) => post.creator)
  posts: Post[];

  @OneToMany(_return => Updoot, (updoot) => updoot.user)
  updoots: Updoot[];

  @Field(_return => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field(_return => String)
  @UpdateDateColumn()
  updatedAt = new Date();
}