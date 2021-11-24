import React, { FunctionComponent } from 'react';
import NextLink from "next/link";
import {Box, IconButton} from "@chakra-ui/react";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";
import {useDeletePostMutation} from "../generated/graphql";
import {useRouter} from "next/router";

interface OwnProps {
  postId: number;
}

const EditDeletePostButtons: FunctionComponent<OwnProps> = ({postId}) => {
  const [, deletePost] = useDeletePostMutation()
  const router = useRouter()
  return (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${postId}`}>
        <IconButton
          mr={4}
          aria-label="edit"
          icon={<EditIcon/>}
        />
      </NextLink>
      <IconButton
        onClick={async () => {
          await deletePost({id: postId});
          await router.push("/")
        }}
        aria-label="delete"
        icon={<DeleteIcon/>}
      />
    </Box>
  );
};

export default EditDeletePostButtons;
