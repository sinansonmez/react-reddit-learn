import React, { FunctionComponent } from 'react';
import { Box } from "@chakra-ui/react";

export type WrapperVariant = 'small' | 'regular';

interface OwnProps {
  variant?: WrapperVariant;
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
