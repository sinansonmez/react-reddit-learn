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
          if (props.post.voteStatus === 1) return;
          await vote({value: 1, postId: props.post.id});
        }}
        icon={<ChevronUpIcon/>}
        size="sm"
        colorScheme={props.post.voteStatus === 1 ? "teal" : undefined}
        fontSize="24px"/>
      {props.post.points}
      <IconButton
        aria-label="Down Vote"
        icon={<ChevronDownIcon/>}
        onClick={async () => {
          if (props.post.voteStatus === -1) return;
          await vote({value: -1, postId: props.post.id});
        }}
        size="sm"
        colorScheme={props.post.voteStatus === -1 ? "red" : undefined}
        fontSize="24px"/>
    </Flex>
  );
};

export default UpdootSection;
