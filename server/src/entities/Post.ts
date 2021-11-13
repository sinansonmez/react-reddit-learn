import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
  @CreateDateColumn()
  createdAt = new Date();

  @Field(_return => String)
  @UpdateDateColumn()
  updatedAt = new Date();
}