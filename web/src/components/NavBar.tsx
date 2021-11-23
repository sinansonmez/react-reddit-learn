import React, {FunctionComponent} from 'react';
import {Box, Button, Flex, Link} from "@chakra-ui/react";
import NextLink from "next/link";
import {useLogoutMutation, useMeQuery} from "../generated/graphql";
import {isServer} from "../utils/isServer";

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
          <Button colorScheme="teal" mr={2}>Register</Button>
        </NextLink>
        <NextLink href="/login">
          <Button colorScheme="teal">Login</Button>
        </NextLink>
      </>
    )
  } else {
    body = (
      <Flex align="center">
        <Box mr={2}>{data.me.username}</Box>
        <NextLink href="/create-post">
          <Button colorScheme="teal" mr={2}>Create Post</Button>
        </NextLink>
        <Button
          onClick={() => {
            logout()
          }}
          isLoading={LogoutFetching}
          colorScheme="teal"
          color={LogoutFetching ? "gray" : "white"}
        >Logout</Button>
      </Flex>
    )
  }
  return (
    <Flex position="sticky" top={0} zIndex={1} bg="tomato" p={4} ml={"auto"} align={"center"}>
      <Box>
        <NextLink href="/">
          <Link color="white" fontSize="2xl">
            LiReddit
          </Link>
        </NextLink>
      </Box>
      <Box ml="auto">
        {body}
      </Box>
    </Flex>
  );
};

export default NavBar;
