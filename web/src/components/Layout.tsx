import React, {FunctionComponent} from 'react';
import Wrapper, {WrapperVariant} from "./Wrapper";
import NavBar from "./NavBar";

interface OwnProps {
  variant?: WrapperVariant;
}

const Layout: FunctionComponent<OwnProps> = ({children, variant}) => {
  return (
    <>
      <NavBar/>
      <Wrapper variant={variant}>
        {children}
      </Wrapper>
    </>
  );
};

export default Layout;
