// eslint-disable-next-line no-unused-vars
import { validate, validates } from "./validate";
const user = {
  /**
   *
   */
  get_user: {
    type: ["PullUserRequest", "PullUserResult"],
    topic: "GET_USER",
    method: ({ list }, isForm = false) => {
      const unitVal = {
        uid: {
          name: "用户Uid",
          type: String,
          value: null,
          validate: true
        },
        updateDt: {
          name: "版本号",
          type: Number,
          value: 0,
          validate: true
        }
      };
      // const payloadData = validate(payloadVal, { uid, updateDt });
      // 导出数据格式
      if (isForm) return { payloadVal: unitVal };

      let payloadData = null;
      if (list instanceof Array) {
        list.map(e => {
          e = validate(unitVal, e);
          return e;
        });
        payloadData = { request: list };
      }
      return {
        topic: "GET_USER",
        data: {
          packetid: `PullUserRequest`,
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
            data.payload = data.payload.result;
          } else {
            data.payload = [];
          }
          return data.payload;
        }
      } else {
        console.warn("GET_USER result is error:" + data.msg);
        data.payload = [];
        return data;
      }
    }
  },
  update_user: {
    type: ["ModifyMyInfoRequest", ""],
    topic: "UPDATE_USER",
    method: ({ list }, isForm = false) => {
      // eslint-disable-next-line no-unused-vars
      const payloadVal = {
        type: {
          type: Number,
          value: null, // 0: name 1: portrait 2:extra 3:mute 5:privateChat 8:introduction 10 announcement
          validate: true
        },
        value: {
          type: String,
          value: null,
          validate: true
        }
      };
      const unit = {
        displayName: {
          name: "用户姓名",
          type: String,
          value: null,
          validate: true,
          typeNum: 0
        },
        portrait: {
          name: "头像",
          type: String,
          value: null,
          validate: true,
          typeNum: 1
        },
        gender: {
          name: "性别",
          type: Number,
          value: 1,
          limit: [
            { label: "男", value: 1 },
            { label: "女", value: 2 }
          ],
          validate: true,
          typeNum: 2
        },
        mobile: {
          name: "手机",
          type: String,
          value: null,
          validate: true,
          typeNum: 3
        },
        email: {
          name: "邮箱",
          type: String,
          value: null,
          validate: true,
          typeNum: 4
        },
        address: {
          name: "地址",
          type: String,
          value: null,
          validate: true,
          typeNum: 5
        },
        company: {
          name: "公司名称",
          type: String,
          value: null,
          validate: true,
          typeNum: 6
        },
        social: {
          name: "技能",
          type: String,
          value: null,
          validate: true,
          typeNum: 7
        },
        extra: {
          name: "hyjkim密码",
          type: String,
          value: null,
          validate: true,
          typeNum: 8
        },
        // loginIp: {
        //   name: "登录IP",
        //   type: String,
        //   value: null,
        //   validate: true,
        //   typeNum: 9,
        // },
        type: {
          name: "用户类型",
          type: Number,
          value: 0,
          limit: [
            { label: "普通用户", value: 0 },
            { label: "机械人", value: 1 },
            { label: "管理员", value: 2 }
          ],
          validate: true,
          typeNum: 10
        },
        dt: {
          name: "版本号",
          type: String,
          value: null,
          validate: true,
          typeNum: 11
        }
      };
      // 导出数据格式
      if (isForm) return { payloadVal: unit };
      //   const payloadData = validates(payloadVal, { type, value });
      let payloadData = null;
      if (list instanceof Array) {
        list.map(e => {
          e.value = e.value + "";
          return e;
        });
        payloadData = { entry: list };
      } else {
        payloadData = validates(unit, list);
      }
      return {
        topic: "UPDATE_USER",
        data: {
          packetid: `ModifyMyInfoRequest`,
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
        console.error("UPDATE_USER result is error:" + data.msg);
        return false;
      }
    }
  },
  //置顶&禁言
  modify_userSetting: {
    type: ["ModifyUserSettingResult", "ModifyUserSettingResult"],
    topic: "UUS",
    method: ({ uid, scope, key, value }, isForm = false) => {
      let modifyVal = {
        uid: {
          name: "用户的uid",
          type: String,
          value: null,
          validate: true
        },
        scope: {
          name: "禁言/置顶",
          type: Number,
          value: 1,
          limit: [
            { label: "会话禁言", value: 1 },
            { label: "全局禁言", value: 2 },
            { label: "置顶", value: 3 }
          ],
          validate: true
        },
        key: {
          name: "gid|123/uid|123",
          type: String,
          value: null,
          validate: true
        },
        value: {
          name: "是否禁言/置顶",
          type: String,
          value: 1,
          limit: [
            { label: "否", value: 1 },
            { label: "是", value: 2 }
          ],
          validate: true
        }
      };
      // 导出数据格式
      if (isForm) return { payloadVal: modifyVal };
      const payloadData = validates(modifyVal, { uid, scope, key, value });
      return {
        topic: "UUS",
        data: {
          packetid: "ModifyUserSettingResult",
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
        console.error("UUS result is error:" + data.msg);
        return false;
      }
    }
  },
  //拉取置顶&禁言列表
  get_userSetting: {
    type: ["GetUserSettingRequest", "GetUserSettingRequest"],
    topic: "GUS",
    method: ({ uid, scope, dt, key }, isForm = false) => {
      let userSettinVal = {
        uid: {
          name: "用户的mid",
          type: String,
          value: null,
          validate: true
        },
        scope: {
          name: "禁言/置顶",
          type: Number,
          value: 1,
          limit: [
            { label: "会话禁言", value: 1 },
            { label: "全局禁言", value: 2 },
            { label: "置顶", value: 3 }
          ],
          validate: true
        },
        key: {
          name: "gid|123/uid|123",
          type: String,
          value: null,
          validate: false
        },
        dt: {
          name: "更新时间戳",
          type: String,
          value: null,
          validate: true
        }
      };
      if (isForm) return { payloadVal: userSettinVal };
      const payloadData = validates(userSettinVal, { uid, scope, key, dt });
      // 导出数据格式
      return {
        topic: "GUS",
        data: {
          packetid: "GetUserSettingRequest",
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
        console.error("UUS result is error:" + data.msg);
        return false;
      }
    }
  }
};
export default user;
