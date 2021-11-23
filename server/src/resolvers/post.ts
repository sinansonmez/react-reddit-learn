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
          select p.*,
                 json_build_object(
                         'id', u.id,
                         'username', u.username,
                         'email', u.email,
                         'createdAt', u."createdAt",
                         'updatedAt', u."updatedAt"
                     ) creator,
                 ${
                         req.session.userId
                                 ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
                                 : 'null as "voteStatus"'
                 }
          from post p
                   inner join public.user u on u.id = p."creatorId"
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