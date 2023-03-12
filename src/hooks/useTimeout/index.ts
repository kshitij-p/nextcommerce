import useTimeout from "./useTimeout";

export type TimeoutRef = React.MutableRefObject<
  ReturnType<typeof setTimeout> | undefined
>;

export default useTimeout;
