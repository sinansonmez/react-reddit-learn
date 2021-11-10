import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query } from "type-graphql";
import { Post } from "../entities/Post";

export class PostResolver {
  @Query(_returns => [Post])
  posts(@Ctx() {em}: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(_returns => Post, {nullable: true})
  post(
    @Ctx() {em}: MyContext,
    @Arg("id") id: number
  ): Promise<Post | null> {
    return em.findOne(Post, {id});
  }

  @Mutation(_returns => Post)
  async createPost(
    @Ctx() {em}: MyContext,
    @Arg("title") title: string,
  ): Promise<Post> {
    const post = em.create(Post, {title});
    em.persistAndFlush(post);
    return post;
  }

  @Mutation(_returns => Post, {nullable: true})
  async updatePost(
    @Ctx() {em}: MyContext,
    @Arg("id") id: number,
    @Arg("title", {nullable: true}) title: string,
  ): Promise<Post | null> {
    const post = await em.findOne(Post, {id});
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(_returns => Boolean)
  async deletePost(
    @Ctx() {em}: MyContext,
    @Arg("id") id: number,
  ): Promise<boolean> {
    const post = await em.findOne(Post, {id});
    if (!post) {
      return false;
    }
    em.removeAndFlush(post);
    return true;
  }
}