import React from 'react';
import styled from 'styled-components';
import Loader from './Loader';

const PageLoader = () => {
  return (
    <LoaderWrapper>
      <Loader />
    </LoaderWrapper>
  );
};

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(44, 62, 80, 0.5);
  backdrop-filter: blur(10px);
  z-index: 1000;
`;

export default PageLoader; 