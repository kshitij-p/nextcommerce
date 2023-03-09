import { api } from "../utils/api";

const useTRPCUtils = () => {
  return api.useContext();
};

export default useTRPCUtils;
