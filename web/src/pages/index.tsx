import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";
import {usePostsQuery} from "../generated/graphql";
import Layout from "../components/Layout";
import {Stack, Box, Heading, Text, Flex, Button} from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
  const [response] = usePostsQuery({variables: {limit: 20}});
  if (!response.data && !response.fetching) {
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
          response.data!.posts.map((p) => {
            return <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>;
          })
        )}
      </Stack>
      {response.data ? <Button isLoading={response.fetching} m="auto" my={8} colorScheme="teal">Create Post</Button>: null}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient,
  {
    ssr: true
  }
)(Index)
