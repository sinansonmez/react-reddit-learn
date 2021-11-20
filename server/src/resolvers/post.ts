import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation, ObjectType,
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

@ObjectType()
class PaginatedPosts {
  @Field(_return => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {

  @FieldResolver(_return => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  @Mutation(_return => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() {req}: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const userId = req.session.userId;
    // await Updoot.insert({postId: postId, userId: userId, value: realValue});
    // await getConnection()
    //   .createQueryBuilder()
    //   .update(Post)
    //   .set({points: () => "points + :value"})
    //   .where("id = :id", {id: postId})
    //   .setParameter("value", realValue)
    //   .execute();

    await getConnection().query(
      `
    START TRANSACTION;
    
    insert into updoot ("userId", "postId", value)
    values (${userId},${postId},${realValue});
    
    update post
    set points = points + ${realValue}
    where id = ${postId};
    
    COMMIT;
    `
    );
    return true;
  }

  @Query(_return => PaginatedPosts)
  async posts(
    @Arg("limit", _return => Int) limit: number,
    @Arg("cursor", _return => String, {nullable: true}) cursor: string | null,
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .innerJoinAndSelect("p.creator", "u", "u.id = p.creatorId")
      .orderBy("p.createdAt", "DESC")
      .take(realLimitPlusOne)
    if (cursor) {
      qb.where("p.createdAt < :cursor", {cursor: new Date(parseInt(cursor))});
    }

    const posts = await qb.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };

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