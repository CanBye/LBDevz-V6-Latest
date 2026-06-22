export type SignInStep = "email" | "code" | "success";

export interface NavLink {
  label: string;
  href: string;
}

export interface CanvasRevealEffectProps {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}

export interface ShaderUniforms {
  [key: string]: {
    value: number[] | number[][] | number;
    type: string;
  };
}

export interface ShaderProps {
  source: string;
  uniforms: ShaderUniforms;
  maxFps?: number;
}

export interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  shader?: string;
  center?: ("x" | "y")[];
}