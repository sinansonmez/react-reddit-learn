import React, { FunctionComponent } from 'react';
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface OwnProps {
}

const NavBar: FunctionComponent<OwnProps> = ({}) => {
  const [{fetching: LogoutFetching}, logout] = useLogoutMutation()
  const [{data, fetching}] = useMeQuery({
    pause: isServer()
  })
  let body = null
  if (fetching) {

  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/register">
          <Link color="white" mr={2}>Register</Link>
        </NextLink>
        <NextLink href="/login">
          <Link color="white">Login</Link>
        </NextLink>
      </>
    )
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={() => {logout()}}
          isLoading={LogoutFetching}
          variant="link"
          color={LogoutFetching ? "gray" : "white"}
        >Logout</Button>
      </Flex>
    )
  }
  return (
    <Flex bg="tomato" p={4} ml={"auto"}>
      <Box ml="auto">
        {body}
      </Box>
    </Flex>
  );
};

export default NavBar;
