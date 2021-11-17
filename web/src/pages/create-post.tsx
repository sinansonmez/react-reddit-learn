import {FunctionComponent, useEffect} from 'react';
import {Form, Formik} from "formik";
import InputField from "../components/InputField";
import {Box, Button} from "@chakra-ui/react";
import {useCreatePostMutation} from "../generated/graphql";
import {useRouter} from "next/router";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";
import Layout from "../components/Layout";
import {useIsAuth} from "../utils/useIsAuth";

const CreatePost: FunctionComponent<{}> = ({}) => {
  const router = useRouter();
  useIsAuth()
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant='small'>
      <Formik
        initialValues={{title: "", text: ""}}
        onSubmit={async (values) => {
          const response = await createPost({input: values});
          if (!response.error) {
            await router.push("/")
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField label="Title" placeholder="Enter post title" name="title"/>
            <Box mt={4}>
              <InputField textarea={true} label="Body" placeholder="Enter post" name="text"/>
            </Box>
            <Button type="submit" colorScheme="teal" isLoading={isSubmitting} mt={4}>Create Post</Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
