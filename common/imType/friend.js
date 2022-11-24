// eslint-disable-next-line no-unused-vars
import { validate, validates } from "./validate";
const friend = {
  /**
   * 搜索用户
   */
  sea_user: {
    type: ["SearchUserRequest", "SearchUserResult"],
    topic: "SEA_USER",
    method: ({ keyword, fuzzy }, isForm = false) => {
      const payloadVal = {
        keyword: {
          name: "匿名关键字",
          type: String,
          value: null,
          validate: true
        },
        fuzzy: {
          name: "是否模糊查询",
          type: Number,
          limit: [
            { label: "模糊", value: 1 },
            { label: "精确", value: 0 }
          ],
          value: 1, // 0: not silence 1: to silence
          validate: true
        }
      };
      const payloadData = validate(payloadVal, { keyword, fuzzy });
      // 导出数据格式
      if (isForm) return { payloadVal: payloadVal };
      return {
        topic: "SEA_USER",
        data: {
          packetid: `SearchUserRequest`,
          payload: payloadData // { gid, silence,userId }
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          // data.payload = true;
          return data;
        } else {
          // data.payload = true;
          if (data.payload) {
            data.payload = data.payload.entry;
          } else {
            data.payload = [];
          }
          return data;
        }
      } else {
        console.warn("SEA_USER result is error:" + data.msg);
        data.payload = [];
        return data;
      }
    }
  },
  /**
   * 申请添加好友
   */
  add_friend: {
    type: ["AddFriendRequest", ""],
    topic: "ADD_FRIEND",
    method: ({ targetUid, reason, fromsource, detailedDescription, alias, fromTag, targetTag }, isForm = false) => {
      const payloadVal = {
        targetUid: {
          name: "用户uid",
          type: String,
          value: null,
          validate: true
        },
        reason: {
          name: "原因",
          type: String,
          value: null,
          validate: false
        },
        fromsource: {
          name: "来源",
          type: Number, // [0-2]
          limit: [
            { label: "通过群", value: 0 },
            { label: "扫码", value: 1 },
            { label: "手机号码", value: 2 }
          ],
          value: 2,
          validate: false
        },
        detailedDescription: {
          name: "详细描述",
          type: String,
          value: null,
          validate: false
        },
        alias: {
          name: "备注",
          type: String,
          value: null,
          validate: false
        },
        fromTag: {
          name: "分组",
          type: Number,
          value: null,
          validate: false
        },
        targetTag: {
          name: "分组",
          type: Number,
          value: null,
          validate: false
        }
      };
      // 导出数据格式
      if (isForm) return { payloadVal: payloadVal };
      const payloadData = validates(payloadVal, {
        targetUid,
        reason,
        fromsource,
        detailedDescription,
        alias,
        fromTag,
        targetTag
      });

      return {
        topic: "ADD_FRIEND",
        data: {
          packetid: `AddFriendRequest`,
          payload: payloadData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return true;
        }
      } else {
        console.error("ADD_FRIEND result is error:" + data.msg);
        return false;
      }
    }
  },
  /**
   * 获取用户通信录
   */
  get_friends: {
    type: ["GetFriendsRequest", "GetFriendsResult"],
    topic: "GET_FRIENDS",
    method: ({ updateDt, targetUid, tag }, isForm = false) => {
      const payloadVal = {
        updateDtVal: {
          type: Number,
          value: 0,
          validate: true
        },
        targetUid: {
          name: "搜索目标好友列表 如果这个参数存在就不使用token中的uid",
          type: String,
          value: "",
          validate: false
        },
        tag: {
          name: "分组查询 0-查全部",
          type: Number,
          value: 0,
          validate: false
        }
      };

      // 导出数据格式
      if (isForm) return { payloadVal: payloadVal };
      const payloadData = validates(payloadVal, {
        updateDt,
        targetUid,
        tag
      });

      return {
        topic: "GET_FRIENDS",
        data: {
          packetid: "get_friends",
          payload: {
            updateDt: payloadData
          }
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          return context.callback(data, context.class);
        } else {
          if (!data.payload) {
            data.payload = null;
          }
          return data.payload ? data.payload.entry : [];
        }
      } else {
        console.warn("GET_FRIENDS result is error:" + data.msg);
        return null;
      }
    }
  },
  /**
   * 拉黑用户
   */
  black_user: {
    type: ["BlackUserRequest", "Version"],
    topic: "BLACK_USER",
    method: ({ targetUid, status }, isForm = false) => {
      const payloadVal = {
        targetUid: {
          name: "用户uid",
          type: String,
          value: null,
          validate: true
        },
        status: {
          name: "来源",
          type: Number, // [0-2]
          limit: [
            { label: "正常", value: 0 },
            { label: "已删除", value: 1 },
            { label: "已拉黑", value: 2 }
          ],
          value: 0,
          validate: true
        }
      };
      // 导出数据格式
      if (isForm) return { payloadVal: payloadVal };
      const payloadData = validates(payloadVal, { targetUid, status });
      return {
        topic: "BLACK_USER",
        data: {
          packetid: `BlackUserRequest`,
          payload: payloadData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return true;
        }
      } else {
        console.error("BLACK_FRIEND result is error:" + data.msg);
        return false;
      }
    }
  },
  /**
   * 删除用户
   */
  delete_user: {
    type: ["UserPK", "Version"],
    topic: "DF",
    method: ({ targetUid }, isForm = false) => {
      const payloadVal = {
        targetUid: {
          name: "用户uid",
          type: String,
          value: null,
          validate: true
        }
      };
      // 导出数据格式
      if (isForm) return { payloadVal: payloadVal };
      const payloadData = validates(payloadVal, { targetUid });
      return {
        topic: "BLACK_USER",
        data: {
          packetid: `UserPK`,
          payload: payloadData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return true;
        }
      } else {
        console.error("BLACK_FRIEND result is error:" + data.msg);
        return false;
      }
    }
  },
  /**
   * 备注用户名
   */
  alisa_user: {
    type: ["AliasUserRequest", ""],
    topic: "ALISA_USER",
    method: ({ targetUid, alias }, isForm = false) => {
      const payloadVal = {
        targetUid: {
          name: "用户uid",
          type: String,
          value: null,
          validate: true
        },
        alias: {
          name: "备注",
          type: String,
          value: null,
          validate: true
        }
      };
      // 导出数据格式
      if (isForm) return { payloadVal: payloadVal };
      const payloadData = validates(payloadVal, { targetUid, alias });
      return {
        topic: "ALISA_USER",
        data: {
          packetid: `AliasUserRequest`,
          payload: payloadData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return true;
        }
      } else {
        console.error("ALISA_USER result is error:" + data.msg);
        return false;
      }
    }
  },
  /**
   * 查询那些用户请求添加的消息列表
   */
  get_friend_request: {
    type: ["Version", "GetFriendRequestResult"],
    topic: "GET_FRIEND_REQUEST",
    method: ({ update_dt }, isForm = false) => {
      const updateDtVal = {
        name: "更新时间",
        type: String,
        value: "0",
        validate: true
      };

      // 导出数据格式
      if (isForm) return { updateDtVal: updateDtData };
      const updateDtData = validate(updateDtVal, { updateDt: update_dt });
      updateDtData.updateDt = updateDtData.updateDt + "";
      return {
        topic: "GET_FRIEND_REQUEST",
        data: {
          packetid: `GetFriendRequest`,
          payload: updateDtData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return data.payload ? data.payload.entry : [];
        }
      } else {
        console.error("GET_FRIEND_REQUEST result is error:" + data.msg);
        return [];
      }
    }
  },
  /**
   * 处理好友请求
   */
  handle_friend: {
    type: ["HandleFriendRequest", ""],
    topic: "HANDLE_FRIEND",
    method: ({ targetUid, fromsource, status, alias }, isForm = false) => {
      const payloadVal = {
        targetUid: {
          name: "对方Uid",
          type: String,
          value: null,
          validate: true
        },
        fromsource: {
          name: "来源",
          type: Number, // [0-2]
          limit: [
            { label: "通过群", value: 0 },
            { label: "扫码", value: 1 },
            { label: "手机号码", value: 2 }
          ],
          value: 2,
          validate: false
        },
        status: {
          name: "处理",
          type: Number, // [0-2]
          limit: [
            { label: "申请", value: 0 },
            { label: "已接受", value: 1 },
            { label: "已拒绝", value: 2 }
          ],
          value: 0,
          validate: true
        },
        alias: {
          name: "备注",
          type: String, // [0-2]
          value: null,
          validate: false
        },
        reason: {
          name: "原因",
          type: String, // [0-2]
          value: null,
          validate: false
        }
      };

      // 导出数据格式
      if (isForm) return { payloadVal };

      const payloadData = validates(payloadVal, {
        targetUid,
        fromsource,
        status,
        alias
      });
      return {
        topic: "HANDLE_FRIEND",
        data: {
          packetid: `HandleFriendRequest`,
          payload: payloadData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return data;
        }
      } else {
        console.error("HANDLE_FRIEND result is error:" + data.msg);
        return [];
      }
    }
  },
  /**
   * 置顶好友，通讯录列表
   */
  handle_top_friend: {
    type: ["HandleTopFriend", ""],
    topic: "TOP_FRIEND",
    method: ({ targetUid, status }, isForm = false) => {
      const payloadVal = {
        targetUid: {
          name: "用户Uid",
          type: String,
          value: null,
          validate: true
        },
        status: {
          name: "处理",
          type: Number, // [0-2]
          limit: [
            { label: "取消", value: 0 },
            { label: "置顶", value: 1 }
          ],
          value: 0,
          validate: true
        }
      };

      // 导出数据格式
      if (isForm) return { payloadVal };

      const payloadData = validates(payloadVal, { targetUid, status });
      return {
        topic: "TOP_FRIEND",
        data: {
          packetid: `HandleTopFriend`,
          payload: payloadData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return data;
        }
      } else {
        console.error("HANDLE_TOP_FRIEND result is error:" + data.msg);
        return [];
      }
    }
  },
  /**
   * 查询对方通信录是否存在自己(判断单删)
   */
  friend_ship: {
    type: ["UserPK", "GetFriendRelationShipResult"],
    topic: "GFR",
    method: ({ targetUid }, isForm = false) => {
      const payloadVal = {
        targetUid: {
          name: "用户Uid",
          type: String,
          value: null,
          validate: true
        }
      };
      // 导出数据格式
      if (isForm) return { payloadVal };
      const payloadData = validates(payloadVal, { targetUid });
      return {
        topic: "GFR",
        data: {
          packetid: `UserPK`,
          payload: payloadData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return data;
        }
      } else {
        console.error("GFR result is error:" + data.msg);
        return [];
      }
    }
  },
  /**
   * 删除消息
   */
  delete_messages: {
    type: ["DeleteMessageRequest", ""],
    topic: "DM",
    method: ({ targetUid }, isForm = false) => {
      const payloadVal = {
        targetUid: {
          name: "用户Uid/群Gid",
          type: String,
          value: null,
          validate: true
        }
      };

      // 导出数据格式
      if (isForm) return { payloadVal };

      const payloadData = validates(payloadVal, { targetUid });
      return {
        topic: "DM",
        data: {
          packetid: `DeleteMessageRequest`,
          payload: payloadData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return data;
        }
      } else {
        console.error("DM result is error:" + data.msg);
        return [];
      }
    }
  },
  /**
   * 服务端主动要求拉取通信录通知
   */
  notify_f: {
    type: ["Version", ""],
    topic: "NOTIFY_F",
    method: ({ updateDt }) => {
      const payloadVal = {
        updateDt: {
          name: "时间戳",
          type: Number,
          value: 0,
          validate: true
        }
      };
      // 导出数据格式
      const payloadData = validates(payloadVal, { updateDt });
      return {
        topic: "NOTIFY_F",
        data: {
          packetid: `Version`,
          payload: payloadData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return data;
        }
      } else {
        console.error("NOTIFY_F result is error:" + data.msg);
        return [];
      }
    }
  },
  //查询好友拉黑状态
  get_friend_status: {
    type: ["UserPK", "GetFriendStatusResult"],
    topic: "GET_FRIEND_STATUS",
    method: ({ targetUid }) => {
      const payloadVal = {
        targetUid: {
          name: "好友uid",
          type: String,
          value: "",
          validate: true
        }
      };
      // 导出数据格式
      const payloadData = validates(payloadVal, { targetUid });
      return {
        topic: "GET_FRIEND_STATUS",
        data: {
          packetid: `UserPK`,
          payload: payloadData
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return data;
        }
      } else {
        console.error("GET_FRIEND_STATUS result is error:" + data.msg);
        return [];
      }
    }
  }
};
export default friend;
