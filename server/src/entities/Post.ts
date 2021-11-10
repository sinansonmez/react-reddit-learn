import { Entity, Property, PrimaryKey } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
  @Field(_type => Int)
  @PrimaryKey()
  id!: number;

  @Field(_type => String)
  @Property({type: "text"})
  title!: string;

  @Field(_type => String)
  @Property({type: "date"})
  createdAt = new Date();

  @Field(_type => String)
  @Property({type: "date", onUpdate: () => new Date()})
  updatedAt = new Date();
}