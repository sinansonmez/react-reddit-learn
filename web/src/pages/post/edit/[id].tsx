import React, {FunctionComponent} from 'react';
import {createUrqlClient} from "../../../utils/createUrqlClient";
import {withUrqlClient} from "next-urql";
import {Form, Formik} from "formik";
import InputField from "../../../components/InputField";
import {Box, Button} from "@chakra-ui/react";
import Layout from "../../../components/Layout";
import {useUpdatePostMutation} from "../../../generated/graphql";
import {useRouter} from "next/router";
import {useGetPostFromUrl} from "../../../utils/useGetPostFromUrl";
import {useGetIntId} from "../../../utils/useGetIntId";

interface OwnProps {
}

const EditPost: FunctionComponent<OwnProps> = ({}) => {
  const [, updatePost] = useUpdatePostMutation();
  const router = useRouter();
  const intId = useGetIntId()
  const [result] = useGetPostFromUrl()

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
    <Layout variant='small'>
      <Formik
        initialValues={{title: result.data?.post?.title, text: result.data?.post?.text}}
        onSubmit={async (values) => {
          const response = await updatePost({id: intId, ...values});
          if (!response.error) {
            await router.push("/post/[id]", `/post/${intId}`);
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField label="Title" placeholder="Enter post title" name="title"/>
            <Box mt={4}>
              <InputField textarea={true} label="Body" placeholder="Enter post" name="text"/>
            </Box>
            <Button type="submit" colorScheme="teal" isLoading={isSubmitting} mt={4}>Update Post</Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(EditPost);
