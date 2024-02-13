import NavButtons from './NavButtons';
import { FC, PropsWithChildren } from 'react';

interface LayoutProps extends PropsWithChildren {}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <NavButtons />
      {children}
    </>
  );
};

export default Layout;
