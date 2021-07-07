import styled from 'styled-components';
import { BREAKPTS } from '../styles';

export const Title = styled.p`
  font-size: 24px;
  line-height: 24px;
  color: black;
  text-align: center;
  font-weight: 300;
  max-width: 500px;
  /* text-transform: uppercase; */
  margin: 0;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 100%;
    font-size: 20px;
    line-height: 20px;
  }
`;

export const SubTitle = styled.p`
  font-size: 24px;
  line-height: 24px;
  color: black;
  font-weight: 700;
  width: 800px;
  /* text-transform: uppercase; */
  margin: 0;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 100%;
  }
`;

export const Text = styled.p`
  font-size: 18px;
  line-height: 24px;
  color: black;
  font-weight: 300;
  max-width: 800px;
  /* text-transform: uppercase; */
  margin: 0;
  @media (max-width: ${BREAKPTS.MD}px) {
    max-width: 100%;
  }
`;

export const RightAlignedText = styled(Text)`
  width: 800px;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 100%;
  }
`;

export const MiniText = styled.p`
  font-size: 14px;
  color: black;
  font-weight: 500;
  text-transform: uppercase;
  margin: 0;
  font-style: italic;
`;

export const Bold = styled.span`
  font-weight: 600;
`;

export const Italic = styled.span`
  font-style: italic;
`;

export const ASpan = styled.span`
  text-decoration: underline;
  color: black;
`;
