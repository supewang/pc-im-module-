import { validate, validates } from "./validate";
import group from "./group";
import friend from "./friend";
import user from "./user";
const base = {
  //群聊模块
  auth: {
    //长认证
    type: ["AuthenticationRequest", "AuthenticationResult"],
    topic: `AUTH`,
    method: ({ userToken, uid }) => {
      const tokenVal = {
        type: String,
        value: null,
        validate: true
      };
      const uidVal = {
        type: String,
        value: null,
        validate: true
      };
      const tokenData = validate(tokenVal, userToken);
      const uidData = validate(uidVal, uid);
      return {
        topic: "AUTH",
        data: {
          packetid: `AuthenticationRequest`,
          payload: {
            token: tokenData,
            cid: uidData
          }
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return {
            pingpongInterval: Number(data.payload.heartbeatInterval) * 1000
          };
        }
      } else {
        console.warn("AUTH result is error:" + data.msg);
        return null;
      }
    }
  },
  sm: {
    //发送消息
    type: ["Message", "SendMessageResult"],
    topic: `SM`,
    method: ({ conversation, content, fromUser, toUser = null, toList = null }) => {
      const conversationVal = {
        type: {
          name: "类型",
          type: Number,
          value: 0, //[0,1]
          limit: [
            { label: "私聊", value: 0 },
            { label: "群聊", value: 1 }
          ],
          validate: true
        },
        target: {
          name: "gid/uid",
          type: String,
          value: null,
          validate: true
        }
      };
      const contentVal = {
        type: {
          name: "持久化/临时",
          type: Number,
          value: 1,
          limit: [
            { label: "临时", value: 0 },
            { label: "持久化", value: 1 }
          ],
          validate: true
        },
        pushContent: {
          name: "离线推送文本",
          type: String,
          value: 0,
          validate: false
        },
        content: {
          name: "文本内容",
          type: String,
          value: 0,
          validate: false
        },
        remoteMediaUrl: {
          name: "多媒体/图片 url",
          type: String,
          value: 0,
          validate: false
        },
        persistFlag: {
          name: "持久化标签",
          type: Number,
          value: 1, //0 1 3 4
          limit: [
            { label: "不持久", value: 0 },
            { label: "持久化", value: 1 },
            { label: "持久化及计数", value: 3 },
            { label: "透明", value: 4 }
          ],
          validate: true
        },
        mentionedType: {
          name: "提示类型",
          type: Number,
          value: 0,
          validate: false
        },
        mentionedTargetList: {
          name: "开启免打后的强制通知",
          type: Array,
          value: null,
          validate: false
        },
        extra: {
          name: "扩展内容",
          type: String,
          value: 0,
          validate: false
        }
      };
      const toUserVal = {
        name: "预留额外接收人",
        type: String,
        value: null,
        validate: false
      };
      const toListVal = {
        name: "预留额外接收人repeated",
        type: Array,
        value: null,
        validate: false
      };
      const fromUserVal = {
        name: "发送者",
        type: String,
        value: null,
        validate: true
      };
      const conversationData = validates(conversationVal, conversation);
      const contentData = validates(contentVal, content);
      const toUserData = toUser ? validate(toUserVal, toUser) : null;
      const toListData = toList ? validates(toListVal, toList) : null;
      const fromUserData = validate(fromUserVal, fromUser);
      let reData = {
        topic: "SM",
        data: {
          packetid: `Message`,
          payload: {
            conversation: conversationData,
            content: contentData,
            fromUser: fromUserData
          }
        }
      };
      toUserData && (reData.toUser = toUserData);
      toListData && (reData.toList = toListData);
      return reData;
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
        console.warn("SM result is error:" + data.msg);
        return null;
      }
    }
  },
  pmn: {
    type: ["", "NotifyMessage"],
    topic: `PMN`,
    method: () => {
      return { topic: "PMN" };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return {
            seq: data.payload.seq
          };
        }
      } else {
        console.warn("PNM result is error:" + data.msg);
        return null;
      }
    }
  },
  pullsm: {
    type: ["PullMessageRequest", "PullMessageResult"],
    topic: "PULLSM",
    method: ({ type, seq }) => {
      const typeVal = {
        name: "消息类型", //固定是0
        type: Number,
        value: 0,
        validate: true
      };
      const seqVal = {
        name: "拉取消息的seq", //拉取消息的seq
        type: Number,
        value: 0,
        validate: true
      };
      const typeData = validate(typeVal, type);
      const seqData = validate(seqVal, seq);

      return {
        topic: "PULLSM",
        data: {
          packetid: `PullMessageRequest`,
          payload: {
            seq: typeData,
            type: seqData
          }
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
        console.warn("PULLSM result is error:" + data.msg);
        return null;
      }
    }
  },
  /**
   * 拉取历史消息，sep取最旧的一条消息的dt
   */
  get_msg: {
    //发送消息
    type: ["GetMessageRequest", "PullMessageResult"],
    topic: `GET_MSG`,
    method: ({ type, targetId, seq }, isForm = false) => {
      const paramVal = {
        type: {
          name: "类型",
          type: Number,
          value: 0,
          limit: [
            { label: "私聊", value: 0 },
            { label: "群聊", value: 1 }
          ],
          validate: true
        },
        targetId: {
          name: "gid/uid",
          type: String,
          value: null,
          validate: true
        },
        seq: {
          name: "消息dt",
          type: Number,
          value: 0,
          validate: true
        }
      };
      const payloadData = validates(paramVal, { type, targetId, seq });
      return {
        topic: "GET_MSG",
        data: {
          packetid: `GetMessageRequest`,
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
        console.warn("GET_MSG result is error:" + data.msg);
        return null;
      }
    }
  },
  ping: {
    type: ["Message", "SendMessageResult"],
    topic: "PING",
    method: () => {
      return {
        topic: "PING",
        data: {
          packetid: "ping"
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
        console.warn("PING result is error:" + data.msg);
        return null;
      }
    }
  },
  logout: {
    type: ["", ""],
    topic: "LOGOUT",
    method: () => {
      return {
        topic: "LOGOUT",
        data: {
          packetid: "logout"
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
        console.warn("PING result is error:" + data.msg);
        return null;
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
   * 搜索服务端消息
   */
  search_messages: {
    type: ["SearchMessageRequest", ""],
    topic: "SEARCH_MESSAGE",
    method: ({ messageDt, pageSize, type, fromUid, toUid, groupId }, isForm = false) => {
      const payloadVal = {
        messageDt: {
          name: "时间，使用毫秒",
          type: Number,
          value: null,
          validate: false
        },
        pageSize: {
          name: "页容量,默认30",
          type: Number,
          value: 0,
          validate: false
        },
        type: {
          name: "会话类型",
          type: Number,
          limit: [
            { label: "私聊", value: 0 },
            { label: "群聊", value: 1 }
          ],
          value: 0,
          validate: false
        },
        fromUid: {
          name: "私聊必须fromUid",
          type: String,
          value: null,
          validate: false
        },
        toUid: {
          name: "私聊必须toUid",
          type: String,
          value: null,
          validate: false
        },
        groupId: {
          name: "群Gid",
          type: String,
          value: null,
          validate: false
        }
      };

      // 导出数据格式
      if (isForm) return { payloadVal };

      const payloadData = validates(payloadVal, {
        messageDt,
        pageSize,
        type,
        fromUid,
        toUid,
        groupId
      });
      return {
        topic: "SEARCH_MESSAGE",
        data: {
          packetid: `SearchMessageRequest`,
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
        console.error("SEARCH_MESSAGE result is error:" + data.msg);
        return [];
      }
    }
  }
};

const topicData = { ...base, ...group, ...friend, ...user };
export default topicData;
