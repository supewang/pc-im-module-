// import { ClientList } from "./clientClass";
import { Message } from "./messageClass";
// import topicMap from "./TypeMap";

import AllMessage from "./allPullMessage";
export class GroupList {
  constructor(topicMap, debug) {
    this._list = new Map();
    this.listToArray = [];
    this.topicMap = topicMap;
    this._currentGroup = null;
    this.groupStatus = 1; // 当前列表状态
    Group._topicMap = this.topicMap;
    Group._grouplist = this._list;
    this._debug = debug;
    this.debug_color = "color: orange";
    this.allMessage = new AllMessage();
  }
  get list() {
    return this._list;
  }
  get currentGroup() {
    return this._currentGroup;
  }
  set currentGroup(group) {
    this._currentGroup = group;
  }
  toArray() {
    let ary = [];
    this._list.forEach(value => {
      ary.push(value);
    });
    this.listToArray = ary;
  }
  getOwnerList(ownerUid) {
    let tmpMap = new Map();
    this._list.forEach(e => {
      if (e.owner == ownerUid) {
        tmpMap.set(e.gid, e);
      }
    });
    return tmpMap;
  }
  getGroupByGid(gid) {
    if (this._list.has(gid)) return this._list.get(gid);
    else return null;
  }
  getListByGGL({ dt, notifyContent, groupStatus }, socket) {
    const _this = this;
    const isClear = this.groupStatus != groupStatus && Number(groupStatus) > -1;
    if (isClear) {
      this.groupStatus = Number(groupStatus);
      _this._list = new Map();
    }
    return socket
      .send(this.topicMap.GGL({ dt, notifyContent, groupStatus }))
      .then(res => {
        if (res.payload) {
          res.payload.info.forEach(e => {
            _this.addGroup(e);
            // _this._list.has(e.gid) || _this._list.set(e.groupInfo.gid, new Group({ debug: _this._debug, ...e.groupInfo }));
          });
          _this.toArray();
          return Promise.resolve(_this.listToArray);
        } else {
          _this.toArray();
          return Promise.resolve([]);
        }
      })
      .catch(err => {
        _this.toArray();
        console.error("res.payload.info is undefine from Api :" + err);
      });
  }

  getList(pullGroupInfo, socket, mslist = []) {
    const _this = this;
    _this.allMessage.allMessageList = mslist;
    let PullGroupInfoListRequest = {
      pullGroupInfo: [pullGroupInfo]
    }
    return socket
      .send(this.topicMap.GGILG( PullGroupInfoListRequest ))
      .then(res => {
        if (res.payload) {
          res.payload.info.forEach(e => {
            _this.addGroup(e);
          });
          _this.toArray();
          return Promise.resolve(_this.listToArray);
        } else {
          _this.toArray();
          return Promise.resolve([]);
        }
      })
      .catch(err => {
        _this.toArray();
        console.error("res.payload.info is from Api :" + err);
      });
  }

  addGroup(groupObj, TGroup = Group) {
    const _this = this;
    let gid = groupObj.gid;
    let tmpGroup = _this.getGroupByGid(gid);
    if (tmpGroup) {
      this.updateGroup(tmpGroup);
    } else {
      tmpGroup = TGroup.NewGroup({ debug: _this._debug, ...groupObj });
      //处理消息
      _this.allMessage.reduceMessage(gid, tmpGroup, true);
      _this._list.set(gid, tmpGroup);
    }
    return tmpGroup;
  }

  CreateGroup(obj, T = Group) {
    const group = new T(obj);
    group.Create(obj);
    if (group) {
      this._list.set(group.gid, group);
      this.groupList.toArray();
    } else console.warn("CreateGroup is error");
  }

  updateGroup(groupObj, data) {
    const _this = this;
    groupObj.updateLocal(data);
    _this._list.set(groupObj.gid, groupObj);
  }
}
export class Group {
  constructor({ gid, name, owner, portrait, memberCount, extra, updateDt, memberUpdateDt, mute, privateChat, introduction, announcement, makeFriend, createDt, debug }) {
    this.gid = gid || null;
    this.name = name;
    this.portrait = portrait;
    this.owner = owner;
    this.memberCount = memberCount;
    this.memberUpdateDt = memberUpdateDt;
    this.mute = mute;
    this.extra = extra;
    this.updateDt = updateDt;
    this.privateChat = privateChat;
    this.introduction = introduction || null;
    this.announcement = announcement || null;
    this.makeFriend = makeFriend;
    this.memberList = new MemberList(this._debug);

    this.createDt = createDt || null;

    this.messages = [];
    this._debug = debug;
    this.SaveRte = 0;
  }
  get topicMap() {
    return Group._topicMap;
  }
  get groupList() {
    return Group._grouplist;
  }
  get socket() {
    return Group._parent.socket;
  }
  static NewGroup(group) {
    return new Group(group);
  }

  Create(obj) {
    // socket.send(group.topicMap.CG(obj), { callback: group.updateLocal, class: group }).then((res) => {
    this.socket.send(this.topicMap.CG(obj)).then(res => {
      if (res) {
        this.updateLocal(res, this);
        return Promise.resolve(this);
      } else return Promise.resolve(null);
    });
  }
  updateLocal(object, context) {
    context.gid = object.payload.gid;
    context.name = object.payload.name;
    context.portrait = object.payload.portrait;
    context.owner = object.payload.owner;
    context.updateDt = object.payload.updateDt;
    context.memberUpdateDt = object.payload.memberUpdateDt;
  }
  // 解散
  remove(ownerUid, { notifyContent }, socket, groupList) {
    const _this = this;
    if (this.owner == ownerUid) {
      return socket.send(this.topicMap.DG({ gid: _this.gid, notifyContent })).then(res => {
        if (res) {
          groupList._list.delete(_this.gid);
          groupList.toArray();
          return Promise.resolve(true);
        } else {
          return Promise.resolve(false);
        }
      });
    } else {
      console.warn("ownerUid is not current group owner");
      return Promise.resolve(false);
    }
  }
  // 禁言
  silence(obj, socket) {
    return socket.send(this.topicMap.SGM(obj)).then(res => {
      if (res) {
        this.mute = obj.silence;
        return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
    });
  }
  // 修改
  modify({ type, value, key }, socket) {
    return socket.send(this.topicMap.MODIFY_GROUP({ gid: this.gid, type, value })).then(res => {
      if (res) {
        this[key] = value;
        return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
    });
  }
  // 退出
  quit(socket, groupList) {
    return socket.send(this.topicMap.QUIT_GROUP({ gid: this.gid })).then(res => {
      if (res) {
        groupList._list.delete(this.gid);
        groupList.toArray();
        return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
    });
  }
  // 增加用户
  addMembers({ gid, menbers }, socket) {
    const fn_param = arguments;
    const _this = this;
    return new Promise((resolve, reject) => {
      socket
        .send(_this.topicMap.AGM({ gid, menbers }))
        .then(res => {
          if (res) {
            return this.getMenber(0, socket);
          } else {
            return Promise.resolve(false);
          }
        })
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          console.error("addMembers error", err);
          reject(err);
        });
    });
  }
  // 删除用户
  removeMembers({ gid, menbers, dt = 0 }, socket) {
    const _this = this;
    return new Promise(resolve => {
      socket
        .send(_this.topicMap.RGM({ gid, menbers }))
        .then(res => {
          if (res) {
            return _this.getMenber(dt, socket);
          } else {
            return Promise.resolve(false);
          }
        })
        .then(res => {
          return resolve(res);
        });
    });
  }
  // 获取指定用户
  getMenber(dt, socket) {
    !dt && (dt = 0);
    return new Promise(resolve => {
      socket.send(this.topicMap.GET_GROUP_MEMBER({ gid: this.gid, dt })).then(res => {
        if (res.payload && res.payload != null) {
          this.memberList.addList(res.payload.member);
          resolve(this.memberList);
        } else {
          console.error("payload is undefined from socketData");
          resolve(null);
        }
      });
    });
  }
  //禁言群成员
  silenceMember({ silence, userUids }, socket) {
    return new Promise(resolve => {
      socket.send(this.topicMap.SGM({ gid: this.gid, silence, userUids })).then(res => {
        if (res.payload) {
          // _this.memberList.addList(res.payload.member);
          const status = this.memberList.setMemberByMemberId(userUids, "silence", silence);
          if (status) resolve(this.memberList);
          else {
            resolve([]);
          }
        } else {
          console.error("payload is undefine from socketData");
          resolve([]);
        }
      });
    });
  }

  // 增加消息
  addMessage(message, isBaseData = true, T_Message = Message) {
    const msg = T_Message.NewMessage(message, isBaseData);
    // const msg = Message.NewMessage(message, isBaseData);
    // if (!this.messages.includes((e) => e.messageId == msg.message.messageId)) {
    if (!this.messages.some(item => item.dt === msg.message.dt)) {
      this.messages.push(msg);
      this.sortMessages()
        .then(() => {
          this.SaveRte++;
          // 临时用户,信息不保存
          if (this.SaveRte > this.currentSaveRte && !this.isTemp) {
            this.saveMessages();
          }
          return Promise.resolve(this.lastMessage);
        })
        .catch(() => {
          return Promise.resolve(this.lastMessage);
        });
    } else {
      console.warn("%cadd message is double in group class", this.debug_color);
      return Promise.resolve(this.lastMessage);
    }
  }
  // 排序消息
  async sortMessages() {
    try {
      this.messages.sort((a, b) => a.dt - b.dt);
      return Promise.resolve(true);
    } catch (err) {
      console.error("sortMessages is error =>" + err);
      return Promise.reject(null);
    }
  }
  // 保存消息
  async saveMessages() {
    const JSON = JSON.stringify({ client: this.uid, messages: this.messages });
    if (window) {
      this.sortMessages()
        .then(() => {
          window.localStorage.setItem(`client-${this.uid}`, JSON);
          return Promise.resolve(true);
        })
        .catch(() => {
          return Promise.resolve(false);
        });
    } else {
      return Promise.resolve(false);
    }
  }
  // 加载信息
  async loadMessages(T_Message = Message) {
    try {
      if (window) {
        const data = JSON.parse(window.localStorage.getItem(`client-${this.uid}`));
        if (data) {
          this.messages = [];
          data.forEach(e => {
            this.messages.push(T_Message.NewMessage(e, false));
            // this.messages.push(Message.NewMessage(e, false));
          });
          return Promise.resolve(this.messages);
        }
      } else {
        console.warn("window is null");
        return Promise.reject([]);
      }
    } catch (err) {
      console.error("loadMessages error =>" + err);
      return Promise.reject(err);
    }
  }
}
export class MemberList {
  constructor(debug) {
    this._list = new Map();
    this.listToArray = [];
    this._debug = debug;
  }
  addMember(memberData) {
    if (memberData) {
      const member = new Member(memberData, this._debug);
      this._list.set(member.memberId, member);
      this.listToArray.push(member);
    }
  }
  addList(array) {
    this._list = new Map();
    this.listToArray = [];
    array.forEach(e => {
      this.addMember(e);
    });
    return;
  }
  getMemberByMemberId(memberId) {
    return this._list.get(memberId) || null;
  }
  // 改变缓存中的member对象的值
  setMemberByMemberId(memberId, key, value) {
    let currentMember = this._list.get(memberId);
    if (currentMember) {
      currentMember[key] = value;
      const index = this.listToArray.findIndex(e => e.memberId == memberId);
      this.listToArray[index] = currentMember;
      return true;
    } else {
      return false;
    }
  }
}
export class Member {
  constructor({ memberId, alias, type, silence, updateDt, debug,sort }) {
    // const { memberId, alias, type, silence, updateDt } = obj;
    this._debug = debug;
    try {
      this.memberId = memberId;
      if (sort){
        this.sort = sort
      }
      if (alias) {
        this.alias = alias;
      } else {
        this.alias = memberId;
        console.log("alias is undefined from API ");
      }
      this.type = type;
      this.silence = Number(silence) || 0;
      this.silenceStatus = this.silence == 0 ? true : false;
      this.updateDt = updateDt;
    } catch (err) {
      console.error("Member class error => " + err);
    }
  }
  static Create(obj, debug) {
    return new Member(obj, debug);
  }
}
