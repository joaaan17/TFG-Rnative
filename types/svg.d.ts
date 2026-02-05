declare module '*.svg' {
  import * as React from 'react';
  import type { SvgProps } from 'react-native-svg';
  const ReactComponent: React.FC<SvgProps>;
  export default ReactComponent;
}
