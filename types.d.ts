declare module '*.png' {
  const image: import('react-native').ImageSourcePropType;
  export = image;
}
declare const process: {
  env: Record<string, string | undefined>;
};
