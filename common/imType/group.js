import { validate, validates } from "./validate";
const packetId = Math.floor(Math.random() * 42949672 + 1);
const group = {
  cg: {
    //创建群聊
    type: ["CreateGroupRequest", "CreateGroupResult"],
    topic: `CG`,
    method: ({ groupInfo, menbers }, isForm = false) => {
      const groupInfoVal = {
        name: {
          name: "群名",
          type: String,
          value: null,
          validate: true
        },
        portrait: {
          name: "群头像",
          type: String,
          value: null,
          validate: true
        },
        memberCount: {
          name: "群人数",
          type: Number,
          value: null,
          validate: true
        },
        extra: {
          name: "群扩展内容",
          type: Number,
          value: null,
          validate: false
        },
        updateDt: {
          name: "群DT",
          type: Number,
          value: null,
          validate: true
        },
        memberUpdateDt: {
          name: "群成员更新DT",
          type: String,
          value: null,
          validate: true
        },
        mute: {
          name: "禁言",
          limit: [
            { label: "不禁言", value: 0 },
            { label: "禁言", value: 1 }
          ],
          type: Number,
          value: 1,
          validate: true
        },
        privateChat: {
          name: "临时会话",
          limit: [
            { label: "不允许", value: 0 },
            { label: "允许", value: 1 }
          ],
          type: Number, // String,
          value: 1, // "1",
          validate: true
        },
        makeFriend: {
          name: "交友状态",
          limit: [
            { label: "不允许", value: 0 },
            { label: "允许", value: 1 }
          ],
          type: Number,
          value: 0,
          validate: true
        },
        introduction: {
          name: "群简介",
          type: String,
          value: null,
          validate: false
        },
        announcement: {
          name: "群公告",
          type: String,
          value: null,
          validate: false
        }
      };
      const menber = {
        memberId: {
          //uid
          name: "用户Uid",
          type: String,
          value: null,
          validate: true
        },
        alias: {
          name: "群成员别名",
          type: String,
          value: null,
          validate: true
        },
        type: {
          name: "成员权限",
          limit: [
            { label: "普通", value: 0 },
            { label: "管理员", value: 1 },
            { label: "群主", value: 2 },
            { label: "移除", value: 4 }
          ],
          type: Number,
          value: 0,
          validate: true
        },
        silence: {
          name: "禁言",
          limit: [
            { label: "不禁言", value: 0 },
            { label: "禁言", value: 1 }
          ],
          type: Number,
          value: 0,
          validate: true
        },
        updateDt: {
          name: "updateDt",
          type: String,
          value: null,
          validate: false
        }
      };
      let menbersArg = [];
      let groupInfoData = {};
      // 导出数据格式
      if (isForm) return { groupInfoVal, menber };
      // 数组参数处理
      try {
        groupInfoData = validates(groupInfoVal, groupInfo);
        if (menbers.constructor === Array) {
          menbers.forEach(e => {
            let tmp = validates(menber, e);
            if (tmp == null) {
              throw new Error("validate is error =>" + JSON.parse(e));
            }
            menbersArg.push(tmp);
          });
        } else {
          throw new Error("menbers is not Arraay");
        }
      } catch (e) {
        console.error(e);
        return null;
      }
      return {
        topic: "CG",
        data: {
          packetid: "CreateGroupRequest",
          payload: {
            group: {
              groupInfo: groupInfoData,
              members: menbersArg
            }
          }
        }
      };
    },
    result: (data, context) => {
      // if (data.errorCode == 1) {
      //   const group_info = data.payload.group_info;
      //   return {
      //     gid: group_info.gid,
      //     name: group_info.name,
      //     protrait: group_info.protrait,
      //     owner: group_info.owner,
      //     update_dt: group_info.update_dt,
      //     member_update_dt: group_info.member_update_dt,
      //   };
      // } else {
      //   console.warn("CG result is error:" + data.msg);
      //   return null;
      // }
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          return true;
        } else {
          return data;
        }
      } else {
        console.warn("CG result is error:" + data.msg);
        return null;
      }
    }
  },
  dg: {
    type: ["DismissGroupRequest", ""],
    topic: "DG",
    method: ({ gid, notifyContent }, isForm = false) => {
      const payloadVal = {
        gid: {
          type: String,
          value: null,
          validate: true
        },
        notifyConten: {
          type: String,
          value: null,
          validate: false
        }
      };
      if (isForm) return payloadVal;
      const payloadData = validates(payloadVal, { gid, notifyContent });
      return {
        topic: "DG",
        data: {
          packetid: "DismissGroupRequest",
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
        console.warn("DG result is error:" + data.msg);
        return null;
      }
    }
  },
  agm: {
    type: ["AddGroupMemberRequest", ""],
    topic: "AGM",
    method: ({ gid, menbers }, isForm = false) => {
      const gidVal = {
        type: String,
        value: null,
        validate: true
      };
      const memberVal = {
        memberId: {
          name: "用户Uid",
          type: String,
          value: null,
          validate: true
        },
        alias: {
          name: "用户匿名",
          type: String,
          value: null,
          validate: true
        },
        type: {
          name: "用户权限",
          type: Number,
          limit: [
            { label: "吃瓜", value: 0 },
            { label: "水军", value: 1 },
            { label: "群主", value: 2 }
          ],
          value: 0, //0:normal 1:admin 2:master
          validate: true
        }
      };
      let membersList = [];
      // 导出数据格式
      if (isForm) return { memberVal: memberVal };
      const gidData = validate(gidVal, gid);
      try {
        if (menbers.constructor === Array) {
          menbers.forEach(e => {
            let tmp = validates(memberVal, e);
            if (tmp == null) {
              throw new Error("validate is error =>" + JSON.parse(e));
            }
            membersList.push(tmp);
          });
        } else {
          throw new Error("menbers is not Arraay");
        }
      } catch (e) {
        console.error(e);
        return null;
      }
      return {
        topic: "AGM",
        data: {
          packetid: "AddGroupMemberRequest",
          payload: {
            gid: gidData,
            addedMember: membersList
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
          return true;
        }
      } else {
        console.warn("AGM result is error:" + data.msg);
        return false;
      }
    }
  },
  rgm: {
    type: ["RemoveGroupMemberRequest", ""],
    topic: "RGM",
    method: ({ gid, menbers }, isForm = false) => {
      const gidVal = {
        type: String,
        value: null,
        validate: true
      };
      // eslint-disable-next-line no-unused-vars
      const memberVal = {
        type: Array,
        value: null,
        validate: true
      };
      console.log(gid, menbers)
      // 导出数据格式
      if (isForm) return { gid: gidData, menber: menbers };
      const gidData = validate(gidVal, gid);
      // const memberUnit = validate(memberVal, null);
      console.log(gidData,'gidData')
      // console.log(memberUnit,'memberUnit')
      const memberData = menbers;
      return {
        topic: "RGM",
        data: {
          packetid: "RemoveGroupMemberRequest",
          payload: {
            gid: gidData,
            removedMember: memberData
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
          return true;
        }
      } else {
        console.warn("AGM result is error:" + data.msg);
        return false;
      }
    }
  },
  sgm: {
    type: ["SetGroupMemberSilenceRequest", ""],
    topic: "SGM",
    method: ({ gid, silence, userUids }, isForm = false) => {
      const payloadVal = {
        gid: {
          name: "Gid",
          type: String,
          value: null,
          validate: true
        },
        silence: {
          name: "禁言",
          type: Number,
          limit: [
            { label: "不禁言", value: 0 },
            { label: "禁言", value: 1 }
          ],
          value: 0, // 0: not silence 1: to silence
          validate: true
        }
      };
      // 导出数据格式
      if (isForm) return { payload: payloadData };
      const payloadData = validates(payloadVal, { gid, silence });
      if (userUids instanceof Array) {
        payloadData.userId = userUids;
      } else {
        payloadData.userId = [userUids];
      }
      return {
        topic: "SGM",
        data: {
          packetid: `SetGroupMemberSilenceRequest`,
          payload: payloadData // { gid, silence,userId }
        }
      };
    },
    result: (data, context) => {
      if (data.errorCode == 1) {
        if (context) {
          context.callback(data, context.class);
          data.payload = true;
          return data;
        } else {
          data.payload = true;
          return data;
        }
      } else {
        console.warn("AGM result is error:" + data.msg);
        data.payload = false;
        return data;
      }
    }
  },
  modify_group: {
    type: ["ModifyGroupInfoRequest", ""],
    topic: "MODIFY_GROUP",
    method: ({ gid, type, value }, isForm = false) => {
      const payloadVal = {
        gid: {
          type: String,
          value: null,
          validate: true
        },
        type: {
          type: Number,
          value: 0, // 0: name 1: portrait 2:extra 3:mute 5:privateChat 8:introduction 10 announcement
          validate: true
        },
        value: {
          type: String,
          value: null,
          validate: true
        }
      };
      // 导出数据格式
      if (isForm) return { payload: payloadData };
      const payloadData = validates(payloadVal, { gid, type, value });
      return {
        topic: "MODIFY_GROUP",
        data: {
          packetid: `ModifyGroupInfoRequest`,
          payload: payloadData // { gid, silence,userId }
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
        console.warn("PULLSM result is error:" + data.msg);
        return null;
      }
    }
  },
  quit_group: {
    type: ["QuitGroupRequest", ""],
    topic: "QUIT_GROUP",
    method: ({ gid }, isForm = false) => {
      const payloadVal = {
        gid: {
          type: String,
          value: 0,
          validate: true
        }
      };
      // 导出数据格式
      if (isForm) return { payload: payloadData };
      const payloadData = validates(payloadVal, { gid });
      return {
        topic: "QUIT_GROUP",
        data: {
          packetid: `QuitGroupRequest`,
          payload: payloadData // { gid, silence,userId }
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
        console.warn("PULLSM result is error:" + data.msg);
        return null;
      }
    }
  },
  get_group_member: {
    type: ["PullGroupMemberRequest", "PullGroupMemberResult"],
    topic: "GET_GROUP_MEMBER",
    method: ({ gid, dt }, isForm = false) => {
      const payloadVal = {
        gid: {
          type: String,
          value: null,
          validate: true
        },
        dt: {
          type: Number,
          value: 0,
          validate: true
        }
      };
      // 导出数据格式
      if (isForm) return { payload: payloadData };
      const payloadData = validates(payloadVal, { gid, dt });
      return {
        topic: "GET_GROUP_MEMBER",
        data: {
          packetid: `PullMessageRequest`,
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
        console.warn("PULLSM result is error:" + data.msg);
        return null;
      }
    }
  },
  ggl: {
    type: ["PullGroupListRequest", "PullGroupListResult"],
    topic: "GGL",
    method: ({ dt, notifyContent, groupStatus }, isForm = false) => {
      const payloadVal = {
        notifyContent: {
          name: "自定内容",
          type: String,
          value: null,
          validate: false
        },
        dt: {
          name: "时间截",
          type: Number,
          value: 0,
          validate: true
        },
        groupStatus: {
          name: "筛选状态",
          limit: [
            { label: "全部", value: 0 },
            { label: "启动", value: 1 },
            { label: "禁止", value: 2 },
            { label: "解散", value: 3 }
          ],
          type: Number,
          value: 0,
          validate: true
        }
      };
      // 导出数据格式
      if (isForm) return { payload: payloadData };
      const payloadData = validates(payloadVal, {
        notifyContent,
        dt,
        groupStatus
      });
      return {
        topic: "GGL",
        data: {
          packetid: `PullGroupListRequest`,
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
        console.warn("ggl result is error:" + data.msg);
        return null;
      }
    }
  },
  //新的拉取群聊接口-通过群id数组查群信息请求
  ggilg: {
    type: ["PullGroupInfoListRequest", "PullGroupInfoResult"],
    topic: "GGILG",
    method: ({ pullGroupInfo }, isForm = false) => {
      return {
        topic: "GGILG",
        data: {
          packetid: `PullGroupInfoListRequest`,
          payload: {
            pullGroupInfo: pullGroupInfo
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
        console.warn("GGILG result is error:" + data.msg);
        return null;
      }
    }
  }
};
export default group;
