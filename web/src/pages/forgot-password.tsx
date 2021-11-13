import React, { FunctionComponent, useState } from 'react';
import { Form, Formik } from "formik";
import InputField from "../components/InputField";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import Wrapper from "../components/Wrapper";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgotPasswordMutation } from "../generated/graphql";


const ForgotPassword: FunctionComponent<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{email: ""}}
        onSubmit={async (values ) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({isSubmitting}) => complete ? <Box>if an account email is exist, we will send you an email</Box> : (
          <Form>
            <InputField label="Email" placeholder="Enter your email" name="email"/>
            <Button type={"submit"} variantColor="teal" isLoading={isSubmitting} mt={4}>Send forgot password</Button>
            <Flex>
              <NextLink href="/forgot-password">
                <Link ml="auto">Forgot Password?</Link>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword)
