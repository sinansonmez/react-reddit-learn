import "reflect-metadata"
import {createConnection} from "typeorm";
import express from "express";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import {PostResolver} from "./resolvers/post";
import {UserResolver} from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import {__prod__, COOKIE_NAME} from "./constants";
import {MyContext} from "./types";
import {ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core";
import cors from "cors";
import {Post} from "./entities/Post";
import {User} from "./entities/User";
import path from "path";
import {Updoot} from "./entities/Updoot";
import {createUserLoader} from "./utils/createUserLoader";
import {createUpdootLoader} from "./utils/createUpdootLoader";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "lireddit2",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Updoot],
  });

  await conn.runMigrations();

  // await Post.delete({})

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__,
      },
      saveUninitialized: false,
      secret: "poqjwfıqfuı01*ffaspojdas",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({req, res}): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader()
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start()
  apolloServer.applyMiddleware({app, cors: false});
  app.listen(4000, () => {
    console.log("Server started on port 4000");
  });

}

main().catch((err) => {
  console.error(err);
});