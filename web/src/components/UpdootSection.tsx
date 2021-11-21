import React, {FunctionComponent} from 'react';
import {Flex, IconButton} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronUpIcon} from "@chakra-ui/icons";
import {PostSnippetFragment, useVoteMutation} from "../generated/graphql";

interface OwnProps {
  post: PostSnippetFragment;
}

const UpdootSection: FunctionComponent<OwnProps> = (props) => {
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton
        aria-label="Up Vote"
        onClick={async () => {
          await vote({value: 1, postId: props.post.id});
        }}
        icon={<ChevronUpIcon/>}
        size="sm"
        colorScheme="teal"
        fontSize="24px"/>
      {props.post.points}
      <IconButton
        aria-label="Down Vote"
        icon={<ChevronDownIcon/>}
        onClick={async () => {
          await vote({value: -1, postId: props.post.id});
        }}
        size="sm"
        colorScheme="teal"
        fontSize="24px"/>
    </Flex>
  );
};

export default UpdootSection;
