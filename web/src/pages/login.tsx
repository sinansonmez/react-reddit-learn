import React, { FunctionComponent } from 'react';
import { Formik, Form } from 'formik';
import Wrapper from "../components/Wrapper";
import { Box, Button } from "@chakra-ui/react";
import InputField from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";


const Login: FunctionComponent<{}> = ({}) => {
  const [, login] = useLoginMutation()
  const router = useRouter()
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{username: "", password: ""}}
        onSubmit={async (values, {setErrors}) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            // worked
            router.push("/");
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField label="Username" placeholder="Enter your username" name="username"/>
            <Box mt={4}>
              <InputField label="Password" placeholder="Enter your password" name="password" type="password"/>
            </Box>
            <Button type={"submit"} variantColor="teal" isLoading={isSubmitting} mt={4}>Login</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
