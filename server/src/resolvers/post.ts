// noinspection SqlNoDataSourceInspection,SqlDialectInspection,CommaExpressionJS

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
import {Updoot} from "../entities/Updoot";
import {User} from "../entities/User";

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

  @FieldResolver(_return => User)
  creator(
    @Root() post: Post,
    @Ctx() {userLoader}: MyContext
  ) {
    return userLoader.load(post.creatorId);
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
    const updoot = await Updoot.findOne({where: {postId, userId}});

    // if the user has voted on this post before, we need to update the value
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(`
            UPDATE updoot
            SET value = $1
            WHERE "postId" = $2
              AND "userId" = $3
        `, [realValue, postId, userId]);
        await tm.query(`
            UPDATE post
            SET points = points + $1
            WHERE id = $2
        `, [2 * realValue, postId]);
      });
    } else if (!updoot) {
      // if the user has never voted on this post before, we need to insert a new row
      await getConnection().transaction(async (tm) => {
        await tm.query(`
            INSERT INTO updoot ("userId", "postId", value)
            VALUES ($1, $2, $3)
        `, [userId, postId, realValue]);
        await tm.query(`
            UPDATE post
            SET points = points + $1
            WHERE id = $2
        `, [realValue, postId]);
      });
    } else {
      // if the user has not voted on this post before, we need to create a new updoot
      await getConnection().transaction(async (tm) => {
        await tm.query(`
            INSERT INTO updoot (userId, postId, value)
            VALUES ($1, $2, $3)
        `), [userId, postId, realValue]
        await tm.query(`
            UPDATE post
            SET points = points + $1
            WHERE id = $2
        `), [realValue, postId]
      });
    }
    return true;
  }

  @Query(_return => PaginatedPosts)
  async posts(
    @Arg("limit", _return => Int) limit: number,
    @Arg("cursor", _return => String, {nullable: true}) cursor: string | null,
    @Ctx() {req}: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replacements: any[] = [realLimitPlusOne];

    if (req.session.userId) replacements.push(req.session.userId);
    let cursorIndex = 3;
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIndex = replacements.length;
    }

    const posts = await getConnection().query(
      `
          select p.*, ${
                  req.session.userId
                          ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
                          : 'null as "voteStatus"'
          }
          from post p
              ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}
          order by p."createdAt" DESC
              limit $1
      `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };

  }

  @Query(_return => Post, {nullable: true})
  post(
    @Arg("id", _return => Int) id: number
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", _return => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() {req}: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({title, text})
      .where("id = :id and creatorId = :creatorId", {id, creatorId: req.session.userId})
      .returning("*")
      .execute()

    return result.raw[0];
  }

  @Mutation(_return => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", _return => Int) id: number,
    @Ctx() {req}: MyContext
  ): Promise<boolean> {
    // not cascaded way
    // const post = await Post.findOne(id);
    // if (!post) return false;
    // if (post.creatorId !== req.session.userId) throw new Error("not authorized");
    // await Updoot.delete({postId: id});
    // await Post.delete(id);
    await Post.delete({id, creatorId: req.session.userId});
    return true;
  }
}