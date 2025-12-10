import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="spinner">
        <div className="spinnerin" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .spinner {
    width: 3.5em;
    height: 3.5em;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #38bdf8; /* var(--color-accent) hardcoded for styled-comp safety if global not ready */
    border-right-color: #8b5cf6; /* Purple nuance */
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
    animation: spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  }

  .spinnerin {
    display: none; /* Remove inner dot for cleaner look */
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default Loader; 