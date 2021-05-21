import React from 'react';
import { animated } from 'react-spring';
import styled from 'styled-components';

export interface CanvasProps {
  prerenderPayload: any;
  onHasDrawn?: () => void;
  shouldEnableRAFLoop?: boolean;
}

export interface ParallaxCanvasProps extends CanvasProps {
  isParallax?: boolean;
  delta?: [number, number];
}

const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  z-index: 1;
  position: relative;
`;

export const SketchCanvas = animated(StyledCanvas);
