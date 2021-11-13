import React, { useState } from 'react';
import { NextPage } from "next";
import { Form, Formik } from "formik";
import InputField from "../../components/InputField";
import { Box, Button, Link } from "@chakra-ui/react";
import Wrapper from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from '../../utils/createUrqlClient';
import NextLink from 'next/link';

const ChangePassword: NextPage<{token: string}> = ({token}) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState("")

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{newPassword: ""}}
        onSubmit={async (values, {setErrors}) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token: token
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errorMap) {
              setTokenError(errorMap.token)
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            // worked
            router.push("/");
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField label="New Password" placeholder="New Password" name="newPassword" type="password"/>
            {tokenError ?
              <Box>
                <Box color="red">{tokenError}</Box>
                <NextLink href="/forgot-password">
                  <Link>Click here to get a new one</Link>
                </NextLink>
              </Box>
              : null}
            <Button type={"submit"} variantColor="teal" isLoading={isSubmitting} mt={4}>Change Password</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({query}) => {
  return ({token: query.token as string});
}

export default withUrqlClient(createUrqlClient)(ChangePassword);
