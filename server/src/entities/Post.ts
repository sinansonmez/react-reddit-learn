import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(_return => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(_return => String)
  @Column()
  title!: string;

  @Field(_return => String)
  @Column()
  text!: string;

  @Field(_return => Int)
  @Column({type: "int", default: 0})
  points!: number;

  @Field(_return => Int)
  @Column()
  creatorId!: number;

  @ManyToOne(_return => User, (user) => user.posts)
  creator!: User;

  @Field(_return => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field(_return => String)
  @UpdateDateColumn()
  updatedAt = new Date();
}