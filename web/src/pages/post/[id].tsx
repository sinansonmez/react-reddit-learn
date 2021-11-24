import React, {FunctionComponent} from 'react';
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../../utils/createUrqlClient";
import Layout from "../../components/Layout";
import {Heading} from "@chakra-ui/react";
import {useGetPostFromUrl} from "../../utils/useGetPostFromUrl";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import {useMeQuery} from "../../generated/graphql";

interface OwnProps {
}

const Post: FunctionComponent<OwnProps> = ({}) => {
  const [result] = useGetPostFromUrl()
  const [meData] = useMeQuery();
  if (result.fetching) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (result.error) {
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
      {meData.data?.me?.id !== result.data.post.creator?.id ? null : <EditDeletePostButtons postId={result.data.post.id}/>}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);
