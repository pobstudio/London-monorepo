import styled from 'styled-components';
import { FlexCenter } from './flex';

export const ModalCover = styled(FlexCenter)`
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const ModalContent = styled.div`
  background: white;
  border: 1px solid black;
  position: relative;
`;

export const ModalInnerContent = styled.div`
  padding: 14px;
  min-width: 360px;
`;

export const ModalDismissButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  border: none;
  background: none;
  padding: 8px;
  opacity: 0.7;
`;
