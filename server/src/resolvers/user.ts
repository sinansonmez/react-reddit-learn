import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query } from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(_type => [FieldError], {nullable: true})
  errors?: FieldError[];
  @Field(_type => User, {nullable: true})
  user?: User;
}

export class UserResolver {

  @Query(_returns => User, {nullable: true})
  async me(@Ctx() {req, em}: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, {id: req.session.userId});
    return user;
  }

  @Query(_returns => [User])
  users(@Ctx() {em}: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  @Mutation(_returns => UserResponse)
  async register(
    @Ctx() {req, em}: MyContext,
    @Arg("options") options: UsernamePasswordInput
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {errors: [{field: "username", message: "length must be greater than 2"}]};
    }

    if (options.password.length <= 2) {
      return {errors: [{field: "password", message: "length must be greater than 2"}]};
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {username: options.username, password: hashedPassword});

    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
        return {errors: [{field: "username", message: "username already taken"}]};
      }
      console.log(err);
    }

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session.userId = user.id;

    return {user};
  }

  @Mutation(_returns => UserResponse)
  async login(
    @Ctx() {em, req}: MyContext,
    @Arg("options") options: UsernamePasswordInput
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {username: options.username});
    if (!user) {
      return {errors: [{field: "username", message: "username not found"}]}
    }

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {errors: [{field: "password", message: "invalid password"}]}
    }

    req.session.userId = user.id;

    return {user};
  }

}