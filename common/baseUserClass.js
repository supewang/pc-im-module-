import User from "./userClass";
const { topiclist } = require("./base/TypeMap");
const topicMap = topiclist;
export default class BaseUser extends User {
  constructor(args, TClientList, TGroupList) {
    super(args, TClientList, TGroupList);
  }

  static Login(data, TUser = BaseUser) {
    return new Promise(resolve => {
      resolve(BaseUser.InitAfter(data, TUser));
    });
  }

  initCommunicationList(long = true) {
    const _this = this;
    try {
      // 长订阅的处理方法
      long && this.initLongSubscribe();
      // 主动拉取信息
      const seq = _this.project.configData.message_seq.get();
      return _this.socket
        .send(
          topicMap.PULLSM({
            seq: seq
          })
        )
        .then(data => {
          if (data) {
            console.log("PULLSM init finish");
            return _this.getPMN(data, this);
          } else {
            console.error("PULLSM init faile");
            return Promise.resolve(false);
          }
        });
    } catch (err) {
      console.error("error=>" + err);
      return Promise.resolve(false);
    }
  }
  /**
   *
   * @param {*} data  创建群信息
   * @param {*} context 返回的对象,这里是User对象
   */

  setGropClient(data, context, mslist = []) {
    const _this = context;
    try {
      let pullGroups = data.map(p => {
        return {
          gid: p.conversation.target,
          dt: 0
        };
      });

      return _this.groupList.getList(pullGroups, _this.socket, mslist).then(res => {
        if (res) {
          _this.groupList.listToArray.forEach(g => {
            _this.getGroupMembersByGid(g.gid);
          });
        } else {
          console.error("groupList init faile");
        }
        // 初始化ClientList列表
        return _this.clientList.getList(
          {
            updateDt: 0,
            targetUid: this.uid,
            tag: 0
          },
          _this.socket,
          mslist
        );
      });
    } catch (err) {
      console.error("error in setGropClient => ", err);
    }
  }

  /**
   * 处理PMN的数据返回
   * @param {Object} data 返回的数据
   * @param {UserObject} context 返回的对象,这里是User对象
   */
  getPMN(data, context) {
    try {
      console.log("data getPMN in UserClass =>", data);
      const mslist = data.payload ? data.payload.message : [];
      let hasGidMessage = mslist.filter(m => m.content.type == 104);

      if (hasGidMessage.length > 0) {
        context.setGropClient(hasGidMessage, context, mslist);
        // mslist.forEach(msg => {
        //   const client = context.getClientByUid(msg.fromUser);
        //   const group = context.getGroupByGid(msg.conversation.target);
        //   if (client) {
        //     client.addMessage(msg);
        //   } else if (group) {
        //     group.addMessage(msg);
        //   } else {
        //     context.otherMessage.push(msg);
        //   }
        // });
      }
      const count = data.payload ? data.payload.currentSeq : 0;
      console.log("getPMN message list coutnt:" + count);
      return true;
    } catch (err) {
      console.error("error in getPMN => ", err);
      return false;
    }
  }
}
