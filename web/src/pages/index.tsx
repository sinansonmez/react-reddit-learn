import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";
import {usePostsQuery} from "../generated/graphql";
import Layout from "../components/Layout";
import {Box, Button, Flex, Heading, Stack, Text} from "@chakra-ui/react";
import NextLink from "next/link";
import {useState} from "react";
import UpdootSection from "../components/UpdootSection";

const Index = () => {
  const [variables, setVariables] = useState({limit: 15, cursor: null as null | string});
  const [response] = usePostsQuery({variables: variables});
  if (!response.data && response.fetching) {
    return (
      <Layout>
        <div>Failed query for some reason</div>
      </Layout>
    );
  }
  return (
    <Layout>
      <Flex align="center">
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Button ml="auto" colorScheme="teal">Create Post</Button>
        </NextLink>
      </Flex>
      <Stack spacing={8} mt={4}>
        {response.fetching && !response.data ? (
          <div>loading...</div>
        ) : (
          response.data!.posts.posts.map((p) =>
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={p} />
              <Box>
                <Heading fontSize="xl">{p.title}</Heading>
                {p.creator?.username || "null"}
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            </Flex>)
        )}
      </Stack>
      {response.data && response.data.posts.hasMore ?
        <Button onClick={() => {
          setVariables({
            limit: variables.limit,
            cursor: response.data!.posts.posts[response.data!.posts.posts.length - 1].createdAt
          })
        }} isLoading={response.fetching} m="auto" my={8} colorScheme="teal">Load More</Button> : null}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient,
  {
    ssr: true
  }
)(Index)
