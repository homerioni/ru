/// <reference types="styled-components/cssprop" />

declare module '*.png';
declare module '*.jpg';
declare module '*.svg';
declare module '*.graphql';
declare module '*.mp4' {
  const src: string;
  export default src;
}
