import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from "type-graphql";
import {Post} from "../entities/Post";
import {isAuth} from "../middleware/isAuth";
import {MyContext} from "../types";
import {getConnection} from "typeorm";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver(Post)
export class PostResolver {

  @FieldResolver(_return => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  @Query(_return => [Post])
  posts(
    @Arg("limit", _return => Int) limit: number,
    @Arg("cursor", _return => String, {nullable: true}) cursor: string | null,
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .orderBy("p.createdAt", "DESC")
      .take(realLimit)
    if (cursor) {
      qb.where("p.createdAt < :cursor", {cursor: new Date(parseInt(cursor))});
    }

    return qb.getMany()

  }

  @Query(_return => Post, {nullable: true})
  post(
    @Arg("id") id: number
  ): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(_return => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() {req}: MyContext
  ): Promise<Post> {
    return Post.create({...input, creatorId: req.session.userId}).save();
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