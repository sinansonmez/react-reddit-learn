import React, {FunctionComponent} from 'react';
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../../utils/createUrqlClient";
import {useRouter} from "next/router";
import {usePostQuery} from "../../generated/graphql";
import Layout from "../../components/Layout";
import {Heading} from "@chakra-ui/react";

interface OwnProps {
}

const Post: FunctionComponent<OwnProps> = ({}) => {
  const router = useRouter();
  const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  const [result] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId
    }
  });
  if (result.fetching) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (result.error) {
    console.log(result.error);
    return (
      <Layout>
        <div>Error: {result.error.message}</div>
      </Layout>
    );
  }

  if (!result.data?.post) {
    return (
      <Layout>
        <div>Could not find post</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading>{result.data.post.title}</Heading>
      {result.data.post.text}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);
