import {BaseEntity, Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "./User";
import {Post} from "./Post";

// Updoot is a many-to-many relationship between User and Post (joint table)
// a user can upvote many posts and a post can have many upvotes
// value is the type of votes: upvote or downvote

@Entity()
export class Updoot extends BaseEntity {
  @Column({type: "int"})
  value: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(_return => User, (user) => user.updoots) // you can get the upvotes of a user by using user.updoots
  user: User;

  @PrimaryColumn()
  postId: number;

  @ManyToOne(_return => Post, (post) => post.updoots,{onDelete:"CASCADE"}) // you can get the upvotes of a post by using the post.updoots
  post: Post;
}