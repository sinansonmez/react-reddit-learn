import React, { FunctionComponent } from 'react';
import { Box } from "@chakra-ui/react";

interface OwnProps {
  variant?: 'small' | 'regular';
}

const Wrapper: FunctionComponent<OwnProps> = ({children, variant = "regular"}) => {
  return (
    <Box
      m={ 8 }
      mx="auto"
      maxWidth={ variant === "regular" ? "800px" : "400px" }
      w="100%">
      { children }
    </Box>
  );
};

export default Wrapper;
