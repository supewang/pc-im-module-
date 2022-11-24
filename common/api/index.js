import user from "./user";
const ws = {
  GATEWAY: {
    url: "/loadBalance/gateway",
    method: "get",
    name: "webscoket网关",
  },
};
const restApi = { ...user, ...ws };
export default restApi;
