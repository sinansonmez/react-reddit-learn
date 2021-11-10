import React, { FunctionComponent } from 'react';
import { Formik, Form } from 'formik';
import Wrapper from "../components/Wrapper";
import { Box, Button } from "@chakra-ui/react";
import InputField from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";

interface OwnProps {
}

const Register: FunctionComponent<OwnProps> = ({}) => {
  const [, register] = useRegisterMutation()
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{username: "", password: ""}}
        onSubmit={async (values) => {
          const response = await register(values);
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField label="Username" placeholder="Enter your username" name="username"/>
            <Box mt={4}>
              <InputField label="Password" placeholder="Enter your password" name="password" type="password"/>
            </Box>
            <Button type={"submit"} variantColor="teal" isLoading={isSubmitting} mt={4}>Register</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
