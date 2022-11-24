const user = {
  LOGIN: {
    url: "/user/login",
    method: "post",
    name: "登录"
  },
  LOGINBYUID: {
    url: "/user/queryUserByImUid",
    method: "post",
    name: "查询用户信息"
  },

  REGISTER: {
    url: "/user/register",
    method: "post",
    name: "注册IM账号"
  },
  ACCESSTOKEN: {
    url: "/auth/accessToken",
    method: "post",
    name: "注册IM账号"
  },
  USERSIG: {
    url: "/user/userSig",
    method: "post",
    name: "usersig 安全保护签名"
  }
};
export default user;
