const { topiclist } = require("./base/TypeMap");
const topicMap = topiclist;
// eslint-disable-next-line no-unused-vars
import { ClientList, Client } from "./clientClass";
import { GroupList } from "./groupClass";
// import { resolve, reject } from "core-js/fn/promise";
class User {
  constructor(args, TClientList = ClientList, TGroupList = GroupList) {
    this.userToken = null;
    this._applicationId = args.applicationId || null; //	string
    this.createTime = args.createTime || null; //	string($date-tdeleteMenmberime)
    this.createUserId = args.createUserId || null; //	integer($int32)
    this.id = args.id || null; //	integer($int32)
    this.passwdMd5 = args.passwdMd5 || null; //	string
    this.registerType = args.registerType || null; //	integer($int32)
    this.status = args.status || null; //	integer($int32)
    this.thirdUserId = args.thirdUserId || null; //	integer($int32)

    this.uid = args.uid || null; //	string im的uid
    this.displayName = args.displayName || null; //	string
    this.portrait = args.portrait || null; //	string
    this.gender = args.gender || null; //	integer($int32)
    this.mobile = args.mobile || null; //	string
    this.email = args.email || null; //	string
    this.address = args.address || null; //	string
    this.company = args.company || null; //	string
    this.extra = args.extra || null; //	string hyjkim登录密码
    this.dt = args.dt || null; //	integer($int64)
    this.social = args.social || null; //	string 技能
    this.type = args.type || null; //	integer($int32) 用户类型 1.机械人  2.管理员   0.普通用户

    this.updateTime = args.updateTime || null; //	string($date-time)
    this.updateUserId = args.updateUserId || null; //	integer($int32)
    this.userId = args.userId || null; //	string
    this._debug = args.debug;
    this.clientList = new TClientList(topicMap, this._debug);
    // this.tmpClientList = new TClientList(topicMap, this._debug);
    this.groupList = new TGroupList(topicMap, this._debug);
    this.otherMessage = [];
    this.currentSeq = null
    this._login_userId = null;
    User._parent.user = this;
    this.userSig = args.userSig || null; //userSig安全保护签名
    this.SDKAPPID = args.SDKAPPID || null; //用于启动TRTCCalling的SDKAppID
    User._parent.setUser(this);
  }
  static async Register({ userId, mobile, passwd, gender, applicationId }) {
    try {
      const param = {
        userId,
        passwd,
        mobile,
        gender,
        applicationId
      };
      const res = await User._parent.http(User._parent.restApi.REGISTER, param);
      if (res) {
        return Promise.resolve(true);
      } else {
        return Promise.reject(false);
      }
    } catch (err) {
      return Promise.reject(false);
    }
  }
  /**
   * 登录时会建立websocket的链接，获取accessToken 和自动注册长链接认证
   * @param {string} userId
   * @returns user object
   */
  static Login(userId, TUser = User) {
    const Project = User._parent;
    // let user = null;
    const param = {
      userId: userId,
      applicationId: Project.applicationId
    };
    return new Promise(resolve => {
      // 1调用登录
      Project.http(Project.restApi.LOGIN, param).then(({ data }) => {
        if (data == null) {
          throw new Error("login is failed,back data is null");
        }
        resolve(User.InitAfter(data, TUser));
      });
    });
  }
  static GetUseInfo(uid) {
    const Project = User._parent;
    const param = { uid };
    return Project.http(Project.restApi.LOGINBYUID, param);
  }
  /**
   *
   * @param {*} data {token,user:{}}
   * @param {*} TUser
   */
  static InitAfter(data, TUser = User) {
    const Project = User._parent;
    let user = null;
    return new Promise(resolve => {
      user = new TUser(data.user);
      user.userToken = data.token;
      user.loginUserId = user.userId;
      user.currentSeq = Project.configData.message_seq.get();
      // 2长连接认证 返回心跳时间间隔，测试环境超过60秒，发送请求，服务器不返回数据
      Project.initSocket()
        .then(finishSocket => {
          if (finishSocket == false) {
            throw new Error("scoket is failed");
          }
          return user.longSocketAuth();
        })
        .then(status_longAuth => {
          if (status_longAuth) {
            return user.initCommunicationList();
          }
        })
        .then(() => {
          resolve(user);
        })
        .catch(err => {
          if (Project.socket && Project.socket.isOpen) {
            Project.socket.closeSocket();
          }
          console.error("User have error in Login function =>", err);
          resolve(null);
        });
    });
  }
  set loginUserId(val) {
    this._login_userId = val;
  }
  get loginUserId() {
    return this._login_userId;
  }
  get socket() {
    return User._parent.socket;
  }
  get project() {
    return User._parent;
  }

  get applicationId() {
    return User._parent.applicationId;
  }
  get sex() {
    const sex_ars = ["男", "女"];
    return sex_ars[this.sex_code];
  }
  set sex(sexString) {
    const sex_ars = ["男", "女"];
    try {
      this.sex_code = sex_ars.findIndex(e => e == sexString) + 1;
      this._sex = sex_ars[this.sex_code];
    } catch (e) {
      this.sex_code = NaN;
      this._sex = null;
    }
  }
  //获取userSig签名
  setUserSiging(userUid = this.uid) {
    return new Promise(resolve => {
      this.project
        .http(this.project.restApi.USERSIG, {
          uid: userUid,
          applicationId: this.project.applicationId
        })
        .then(({ data }) => {
          this.userSig = data.userSig;
          this.SDKAPPID = data.appId;
          resolve(data);
        })
        .catch(err => {
          resolve({});
          console.log("setUserSiging is error", err);
        });
    });
  }

  async logout() {
    console.log(this);
    return new Promise(resolve => {
      // this.socket.send(topicMap.LOGOUT()).then((res) => {
      //   if (res) {
      this.socket.closeSocket();
      resolve(true);
      //   }
      // });
    });
  }
  //长连接认证
  longSocketAuth() {
    if (this.socket && this.userToken) {
      const param = topicMap.AUTH({
        userToken: this.userToken,
        uid: this.uid
      });
      // console.log("param =>", param);
      // 注册监听方法，
      return new Promise(resolve => {
        this.socket
          .send(param)
          .then(res => {
            if (res) {
              console.log("long connection success in User Class,User.uid=>", this.uid);
              // 初始化
              this.socket.reStartPingpong(res.heartbeatInterval);
              resolve(true);
            } else {
              console.error("long connection can not back a good var", res);
              resolve(false);
            }
          })
          .catch(err => {
            console.error("long connection can not back a good var", err);
            resolve(false);
          });
      });
    } else {
      console.warn("is not sigin Pls to regedit or login");
      return Promise.resolve(false);
    }
  }
  // 初始化长订阅
  initLongSubscribe() {
    this.socket.addLongSubscribe(topicMap.PMN(), this.setPMN(this));
    this.socket.addLongSubscribe(
      topicMap.NOTIFY_F({
        updateDt: 0
      }),
      this.notifyFriendMessage(this)
    );
    // this.socket.addLongSubscribe(topicMap.NOTIFY_USER({ updateDt: 0 }), this.notifyFriendMessage(this));
  }
  // 初始化通信录并主动拉取消息
  initCommunicationList(long = true) {
    const _this = this;
    try {
      // if (data) {

      // 初始化Group列表
      return _this.groupList
        .getList(
          {
            dt: 0
          },
          _this.socket
        )
        .then(res => {
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
            _this.socket
          );
        })
        .then(res => {
          if (res) {
            console.log("clientList init finish");
          } else {
            console.error("clientList init faile");
          }
          // 长订阅的处理方法
          long && this.initLongSubscribe();
          // 主动拉取信息
          const seq = _this.project.configData.message_seq.get();
          console.log('seq----------------------',seq)
          return _this.socket.send(
            topicMap.PULLSM({
              seq: seq
            })
          );
        })
        .then(data => {
          if (data) {
            console.log("PULLSM init finish");
            return _this.getPMN(data, this);
          } else {
            console.error("PULLSM init faile");
            return Promise.resolve(false);
          }
        });
      // } else {
      // throw new Error("long auth is failed");
      // }
    } catch (err) {
      console.error("error=>" + err);
      return Promise.resolve(false);
    }
    // 长期注册PMN的处理方法
  }
  /**
   * 处理PNM
   * @param {classT}} context
   * @returns
   */
  setPMN(context,flag) {
    //  this
    return data => {
      this.socket
        .send(
          topicMap.PULLSM({
            seq:  data.seq
          })
        )
        .then(res => {
          context.getPMN(res, context);
        });
    };
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
      window.dispatchEvent(new CustomEvent("updatePMNMessage",{detail: data}))
      // 不含群消息
      mslist.forEach(msg => {
        const client = context.getClientByUid(msg.fromUser);
        const group = context.getGroupByGid(msg.conversation.target);
        if (client) {
          client.addMessage(msg);
        } else if (group) {
          group.addMessage(msg);
        } else {
          context.otherMessage.push(msg);
          // context.tmpClientList
          //   .addClient({
          //     uid: msg.fromUser,
          //     displayName: msg.fromUser,
          //     isTemp: true
          //   })
          //   .addMessage(msg);
        }
      });
      const count = data.payload ? data.payload.currentSeq : 0;
      // 保存当前消息最后得seq
      this.project.configData.message_seq.save(count);
      console.log("getPMN message list coutnt:" + count);
      return true;
    } catch (err) {
      console.error("error in getPMN => ", err);
      return false;
    }
  }
  /**
   * 获取用户资料
   * @param {Array} uids uid数组
   * @returns Array 找不到是空数组[]
   */
  getUserByUids(uids) {
    let params = [];
    uids.forEach(e => {
      params.push({
        uid: e,
        updateDt: 0
      });
    });
    return this.socket.send(topicMap.GET_USER({ params }));
  }
  /**
   * 设置用户资料
   * @param {Array} params uint:{ type, value }
   * @returns Boolean
   */
  setUserByUids(params, values) {
    return new Promise(resolve => {
      this.socket.send(topicMap.UPDATE_USER(params)).then(res => {
        if (res) {
          this.displayName = values.displayName;
          this.portrait = values.portrait;
          this.gender = values.gender;
          this.mobile = values.mobile;
          this.email = values.email;
          this.address = values.address;
          this.company = values.company;
          // this.social=values.social || null,
          this.extra = values.extra;
          // this.loginIp=values.loginIp || null,
          this.type = values.type;
          this.dt = values.dt;
        }
        resolve(res);
      });
    });
  }
  /**
   * 获取用户好友列表 重复，清使用cientList.getList
   */
  initClientList() {
    return this.clientList.getList(0, this.socket);
  }

  /**
   * 删除用户服务端消息
   * @param {} targetUid uid/gid
   * @returns Promise
   */
  deleteMessage(targetUid) {
    const param = topicMap.DM({
      targetUid
    });
    return this.socket.send(param);
  }
  /**
   * 聊天发送消息
   * @param {conversation, content, toUser = null, toList = null} param
   * @returns promise data/null
   */
  sendMessage({ conversation, content, toUser = null, toList = null, isGroup = false, isFriend = false }) {
    if (!isGroup && !isFriend) {
      console.error(" isGroup or isFriend must be true!");
      return Promise.resolve(null);
    }
    const param = topicMap.SM({
      conversation,
      content,
      fromUser: this.uid,
      toUser,
      toList
    });
    return new Promise(resolve => {
      this.socket.send(param).then(res => {
        let msgData = null;
        if (res) {
          msgData = {
            from: this.uid,
            to: conversation.target,
            content: content,
            type: content.type,
            dt: res.payload.dt
            // messageId: res.messageId,
          };
          try {
            if (isGroup) {
              this.groupList.getGroupByGid(msgData.to).addMessage(msgData, false);
            }
            if (isFriend) {
              this.getClientByUid(msgData.to).addMessage(msgData, false);
            }
          } catch (err) {
            console.error("error in sendMessage: " + err);
            resolve(msgData);
          }
        }
        resolve(msgData);
      });
    });
  }

  /**
   * 收索用户
   * @param {String} keyword
   * @param {Number} fuzzy
   * @returns 返回ClientList对象
   */
  searchClients({ keyword, fuzzy }) {
    return ClientList.SearchUser(keyword, fuzzy, topicMap, this.socket);
  }
  /**
   * 申请加好友
   * @param { uid,reason ,from} from 非必填
   * @returns Promose resolve=>true / false
   */
  addClient({ targetUid, reason, fromsource }, TClient = Client) {
    // const param = topicMap.ADD_FRIEND({ uid, reason, from });
    return new Promise(resolve => {
      TClient.AddClient(
        {
          targetUid,
          reason,
          fromsource
        },
        this.socket,
        topicMap
      )
        .then(res => {
          if (res) {
            return this.clientList.getList(
              {
                updateDt: 0
              },
              this.socket
            );
          }
        })
        .then(res => {
          resolve(res);
        });
    });
  }
  /**
   * 设置备注名
   * @param {targetUid, alias} param0
   * @returns Boolean
   */
  aliasClient({ targetUid, alias }) {
    try {
      return this.getClientByUid(targetUid).setAlias(alias, this.socket, topicMap);
    } catch {
      console.warn("can't find client that in list");
      return null;
    }
  }
  /**
   * 拉黑用户
   * @param {String} uid
   * @param {EMUM} status
   * @returns Promise.reolove Boolean
   */
  blackClientByUid({ targetUid, status }) {
    return new Promise(resolve => {
      this.getClientByUid(targetUid)
        .balckClient(
          {
            status
          },
          this.socket,
          topicMap
        )
        .then(res => {
          if (res) {
            this.clientList.refashList(true);
            return this.clientList.getList(
              {
                dt: 0
              },
              this.socket
            );
          } else {
            resolve(res);
          }
        })
        .then(res => {
          resolve(res);
        });
    });
  }
  /**
   * 删除群成员
   * @param {*} uid
   * @returns Promise true|false
   */
  deleteClientByUid(uid) {
    return new Promise(resolve => {
      this.getClientByUid(uid)
        .deleteClient(this.socket, topicMap)
        .then(res => {
          if (res) {
            this.clientList.refashList(true);
            return this.clientList.getList(
              {
                dt: 0
              },
              this.socket
            );
          } else {
            resolve(res);
          }
        })
        .then(res => {
          resolve(res);
        });
    });
  }
  /**
   * 获取本地的用户
   * @param {String} uid 用户的Uid
   * @returns Client
   */
  getClientByUid(uid) {
    if (uid) {
      let client = null;
      if (this.clientList.list.has(uid)) {
        client = this.clientList.list.get(uid);
      }
      return client;
    }
    return null;
  }
  /**
   * 查询那些用户请求添加的消息列表
   * @param {long Int} update_dt
   * @returns Array 返回请求的数组
   */
  getClientRequestList(update_dt = 0) {
    return this.socket.send(
      topicMap.GET_FRIEND_REQUEST({
        update_dt
      })
    );
  }
  /**
   * 处理用户请求申请
   * @param {*} param0
   * @returns
   */
  handleClientByObj({ targetUid, fromsource, status }) {
    return this.socket.send(
      topicMap.HANDLE_FRIEND({
        targetUid,
        fromsource,
        status
      })
    );
  }
  /**
   * 好友置顶
   * @param {String} targeId 用户uid
   * @param {Number} status 0:取消， 1:置顶
   */
  setClientToTopList(targetUid, status) {
    return new Promise(resolve => {
      this.getClientByUid(targetUid)
        .setTopInList(
          {
            status
          },
          this.socket,
          topicMap
        )
        .then(() => {
          return this.clientList.getList(0, this.socket);
        })
        .then(list => {
          resolve(list);
        })
        .catch(err => {
          console.warn("setClientToTopList is error =>", err);
        });
    });
  }

  /**
   * 查询对方通信录是否存在自己(判断单删)
   * @param {String} targetUid
   */
  getTargetClientShip(targetUid) {
    return this.getClientByUid(targetUid).getFriendShip(this.socket, topicMap);
  }
  /**
   * 创建群
   * @param {Object} data
   */
  createGroup(data) {
    return this.socket.send(topicMap.CG(data));
    // .then(res => {
    //   console.log(res);
    // });
    // this.groupList.CreateGroup(data);
  }
  getGroupByGid(gid) {
    return this.groupList.getGroupByGid(gid);
  }
  /**
   * return Promise groupList._list
   */
  getGroupList({ refash = false,gid = null, dt = 0, groupStatus = 1, notifyContent = null }) {
    if (refash) {
      return this.groupList.getList(
        {
          dt,
          groupStatus,
          notifyContent,
          gid
        },
        this.socket
      );
    } else {
      // if (this.groupList.list.size > 0) return Promise.resolve(this.groupList.listToArray);
      // else
      return this.groupList.getList(
        {
          dt: 0,
          gid
        },
        this.socket
      );
    }
  }
  removeGroupByGid(gid, notifyContent = null) {
    let param = {};
    param.notifyContent = notifyContent || null;
    try {
      return this.groupList.getGroupByGid(gid).remove(this.uid, param, this.socket, this.groupList);
    } catch (err) {
      return Promise.resolve(null);
    }
  }
  editGroupByGid(gid, { type, value, key }) {
    try {
      return this.groupList.getGroupByGid(gid).modify(
        {
          type,
          value,
          key
        },
        this.socket
      );
    } catch (err) {
      return Promise.resolve(null);
    }
  }
  /**
   * 退出群
   * @param {} gid
   * @returns
   */
  quitGroupByGid(gid) {
    try {
      const currentGroup = this.groupList.getGroupByGid(gid);
      if (currentGroup.owner == this.uid) {
        throw new Error("群主只能解散群，不能退出群");
      }
      return currentGroup.quit(this.socket, this.groupList);
    } catch (err) {
      console.error(err);
      return Promise.resolve(null);
    }
  }
  /**
   * 查找群成员
   * @param {*} gid
   * @param {*} dt
   * @returns
   */
  getGroupMembersByGid(gid, dt = 0) {
    try {
      const group = this.groupList.getGroupByGid(gid);
      if (group) {
        return group.getMenber(dt, this.socket);
      } else {
        throw new Error("return data is null=>[]");
      }
    } catch (err) {
      console.error("error function: getGroupMembersByGid in UserClass", err);
      return Promise.resolve([]);
    }
  }
  /**
   * 增加群成员
   * @param {} param0
   * @returns
   */
  addGroupMembers({ gid, menbers }) {
    try {
      const group = this.groupList.getGroupByGid(gid);
      if (group) {
        return group.addMembers(
          {
            gid,
            menbers
          },
          this.socket
        );
      } else {
        throw new Error("return data is null=>[]");
      }
    } catch (err) {
      console.error("error function: getGroupMembersByGid in UserClass", err);
      return Promise.resolve([]);
    }
  }
  /**
   * 禁言群成员
   * @param {} param0
   * @returns
   */
  silenceGroupMember({ gid, userUids, silence }) {
    try {
      const group = this.groupList.getGroupByGid(gid);
      if (group) {
        return group.silenceMember(
          {
            silence,
            userUids
          },
          this.socket
        );
      } else {
        throw new Error("return data is null=>[]");
      }
    } catch (e) {
      console.error("error function: getGroupMembersByGid in UserClass", e);
      return Promise.resolve([]);
    }
  }
  /**
   * 删除群成员
   * @param {*} gid
   * @param {*} menbers
   * @returns
   */
  deleteMenmber(gid, menbers) {
    try {
      const group = this.groupList.getGroupByGid(gid);
      if (group) {
        return group.removeMembers(
          {
            gid,
            menbers
          },
          this.socket
        );
      } else {
        throw new Error("group is null by gid=>" + gid);
      }
    } catch (e) {
      console.error("error function: deleteMenmber in UserClass", e);
      return Promise.resolve(false);
    }
  }
  /**
   * 置顶/禁言群聊/单聊
   * @param {String} uid uid
   * @param {String} scope 禁言/置顶类型
   * @param {String} key 置顶（群聊gid|122 单聊uid|123）；禁言：key为gid值
   * @param {String} value 0-否 1-是
   */
  modifyUser({ scope, key, value }) {
    return new Promise(resolve => {
      this.socket
        .send(
          topicMap.UUS({
            uid: this.uid,
            scope,
            key,
            value
          })
        )
        .then(res => {
          resolve(res);
        })
        .catch(e => {
          console.error("error function: modifyUser in UserClass", e);
          return Promise.resolve(false);
        });
    });
  }
  /**
   * 拉取置顶&禁言列表
   * @param {String} uid uid
   * @param {String} scope 禁言/置顶类型
   * @param {String} key 置顶（群聊gid|122 单聊uid|123）；禁言：key为gid值
   * @param {String} dt 更新时间戳
   */
  getUserSettingList({ scope, key, dt }) {
    return new Promise(resolve => {
      this.socket
        .send(
          topicMap.GUS({
            uid: this.uid,
            scope,
            key,
            dt
          })
        )
        .then(res => {
          resolve(res);
        })
        .catch(e => {
          console.error("error function: getUserSettingList in UserClass", e);
          return Promise.resolve(false);
        });
    });
  }
  /**
   * 推送通信录拉取通知
   * @param {Int} updateDt
   */
  notifyFriendMessage(context) {
    // data.updateDt
    // return data => context.clientList.getList(data.updateDt, context.socket);
    return () => context.clientList.getList(0, context.socket);
  }
  /**
   *查找对方通讯录是否存在自己
   * @param {String} targetUid 目标uid
   */
  checkFriendRequest({ targetUid }) {
    const _this = this;
    return new Promise(resolve => {
      _this.socket
        .send(topicMap.GFR({ targetUid }))
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          console.log("error checkFriendRequest" + err);
        });
    });
  }

  /**
   * 下拉加载历史消息
   */
  getOldMessage(param = {}) {
    const _this = this;
    return new Promise(resolve => {
      _this.socket
        .send(topicMap.GET_MSG(param))
        .then(data => {
          return _this.getPMN(data, this);
        })
        .then(message => {
          resolve(message);
        })
        .catch(err => {
          console.log("error getOldMessage" + err);
        });
    });
  }
}
export default User;
// module.exports = User;
