import React, { FunctionComponent } from 'react';
import { Box, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";


interface OwnProps {
}

const NavBar: FunctionComponent<OwnProps> = ({}) => {
  const [{data, fetching}] = useMeQuery()
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
        <NextLink href="/logout">
          <Link color="white">Logout</Link>
        </NextLink>
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
