declare module 'react-katex' {
  import { ReactNode } from 'react';

  interface MathProps {
    math?: string;
    children?: ReactNode;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
    settings?: any;
  }

  export class InlineMath extends React.Component<MathProps> {}
  export class BlockMath extends React.Component<MathProps> {}
}
