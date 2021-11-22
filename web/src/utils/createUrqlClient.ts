import {dedupExchange, fetchExchange} from "urql";
import {cacheExchange, Resolver} from "@urql/exchange-graphcache";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import betterUpdateQuery from "./betterUpdateQuery";
import {pipe, tap} from "wonka";
import Router from "next/router";
import gql from "graphql-tag";

// @ts-ignore
const errorExchange = ({forward}) => (ops$: any) => {
  // @ts-ignore
  return pipe(
    forward(ops$),
    tap(({error}) => {
      if (error?.message.includes("not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (_parent, _fieldArgs, cache, info) => {
    const {parentKey: entityKey, fieldName} = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${size})`;
    const isItInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    )
    info.partial = !isItInTheCache;
    let hasMore = true;
    // check if the data is already in cache, if so, return it
    const results: string[] = [];
    fieldInfos.forEach((fieldInfo) => {
      const key = cache.resolveFieldByKey(entityKey, fieldInfo.fieldKey) as string;
      const data = cache.resolve(key, "posts");
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });
    return {
      __typename: "PaginatedPosts",
      hasMore: hasMore,
      posts: results,
    };
  }
}

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          vote: (_result, args, cache, _info) => {
            const {postId, value} = args as VoteMutationVariables;
            const data = cache.readFragment(
              gql`
                  fragment _ on Post {
                      id
                      points
                      voteStatus
                  }
              `, {id: postId} as any
            );
            if (data) {
              if (data.voteStatus === value) return;
              const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                cache.writeFragment(
                  gql`
                      fragment __ on Post {
                          points
                          voteStatus
                      }
                  `, { id: postId, points: newPoints, voteStatus: value } as any
                );
            }
          },
          createPost: (_result, _args, cache, _info) => {
            const allFieds = cache.inspectFields("Query")
            const fieldInfos = allFieds.filter((info) => info.fieldName === "posts")
            fieldInfos.forEach((fi) => {
              cache.invalidate("Query", "posts", fi.arguments || {})
            })
          },
          logout: (_result, _args, cache, _info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              () => ({me: null})
            );
          },
          login: (_result, _args, cache, _info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          register: (_result, _args, cache, _info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {me: result.register.user,};
                }
              }
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
