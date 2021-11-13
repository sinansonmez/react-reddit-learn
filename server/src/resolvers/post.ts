import { Arg, Mutation, Query } from "type-graphql";
import { Post } from "../entities/Post";

export class PostResolver {
  @Query(_return => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(_return => Post, {nullable: true})
  post(
    @Arg("id") id: number
  ): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(_return => Post)
  async createPost(
    @Arg("title") title: string,
  ): Promise<Post> {
    return Post.create({title}).save();
  }

  @Mutation(_return => Post, {nullable: true})
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", {nullable: true}) title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      await Post.update({id}, {title});
    }
    return post;
  }

  @Mutation(_return => Boolean)
  async deletePost(
    @Arg("id") id: number,
  ): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}