import { Message } from "./messageClass";
import AllMessage from "./allPullMessage";
export class ClientList {
  constructor(topicMap, debug) {
    this._currentClient = null;
    this.list = new Map();
    this.listToArray = [];
    this.topicMap = topicMap;
    this.debug_color = "color: green";
    this._debug = debug;
    this.allMessage = new AllMessage();
  }
  get clientList() {
    return this.list;
  }
  // friend Api
  getList({ updateDt = 0, targetUid, tag }, socket, mslist = []) {
    const _this = this;
    // return socket.send(this.topicMap.GET_FRIENDS({ updateDt }, { callback: this.refashList, context: this })).then((res) => {
    _this.allMessage.allMessageList = mslist;
    return new Promise(resolve => {
      socket
        .send(_this.topicMap.GET_FRIENDS({ updateDt, targetUid, tag }))
        .then(res => {
          if (res.length > 0) {
            let list = [];
            // _this.refashList();
            let userList = [];
            res.map(e => {
              userList.push(e);
              list.push({
                uid: e.uid,
                updateDt: 0 // e.updateDt, 有dt>0 没有数据返回
              });
            });
            _this.addList(userList);
            return socket.send(_this.topicMap.GET_USER({ list }));
          } else {
            return Promise.resolve([]);
          }
        })
        .then(res => {
          // _this.refashList();
          let userList = [];
          res.map(e => {
            userList.push(e.user); //[object]
          });
          // _this.addList(userList);
          _this.setConcatList(userList);
          resolve(_this.listToArray); //[client]
        });
    });
  }
  setConcatList(array) {
    if (array) {
      array.forEach((a, i) => {
        if (a.uid == this.listToArray[i].uid) {
          // this.listToArray[i] = Object.assign(this.listToArray[i], a);
          this.listToArray[i].reSeting(a);
        } else {
          this.listToArray.push(a);
        }
      });
    }
  }
  refashList(isClear) {
    if (isClear) {
      this.list = new Map();
      this.listToArray = [];
    }
  }
  addList(array) {
    array.forEach(e => {
      this.addClient(e);
    });
    let topList = array.filter(e => e.isTop == 1) || [];
    // 按姓名排序
    topList.sort((a, b) => a.localeCompare(b));
    let otherList = array.filter(e => e.isTop == 0) || [];
    // 按姓名排序
    otherList.sort((a, b) => a.alias.localeCompare(b.alias));
    return topList.concat(otherList);
  }
  addClient(clientObj, TClient = Client) {
    if (this.list.has(clientObj.uid)) {
      this.list.get(clientObj.uid).reSeting(clientObj);
      console.warn("current client already exists in class ClientList");
    } else {
      const client = TClient.NewClient(clientObj, this._debug);
      //处理消息
      this.allMessage.reduceMessage(clientObj.uid, client, false);

      this.list.set(clientObj.uid, client);
      this.listToArray.push(client);
    }
    return this.getClient(clientObj.uid);
  }
  saveClientList() {
    if (window) {
      window.localStorage.setItem("ClientList", JSON.stringify(this.listToArray()));
    } else {
      console.warn("window is null");
    }
  }
  loadClientList() {
    if (window) {
      const data = JSON.parse(window.localStorage.getItem("ClientList"));
      this.addList(data);
    } else {
      console.warn("window is null");
    }
  }
  has(uid) {
    return this.list.has(uid);
  }
  getClient(uid) {
    return this.list.get(uid);
  }
  static SearchUser(keyword, fuzzy, topicMap, socket) {
    return socket.send(topicMap.SEA_USER({ keyword, fuzzy }));
  }
}
/**
 *@param { uid, displayName, isTemp } uid必填
 */
export class Client {
  constructor({ uid, displayName, isTemp, state, updateDt, alias, fromsource, detailedDescription, address, company, createTime, email, extra, gender, mobile, portrait, social, userId, blacked, isTop, debug }) {
    this.uid = uid;
    this.displayName = displayName || uid;
    this.messages = [];
    this.message = null;
    this.saveRte = 5;
    this.currentSaveRte = 1;
    // from get_friends socket Api
    this.state = state || null;
    this.updateDt = updateDt || null;
    this.alias = alias || displayName;
    this.fromsource = fromsource || null;
    this.detailedDescription = detailedDescription || null;
    this.blacked = blacked || 0; // 0:否 1:是
    this.isTop = isTop || 0; // 0:否 1:是

    this.address = address || null;
    this.company = company || null;
    this.createTime = createTime || null;
    this.email = email || null;
    this.extra = extra || null;
    this.gender = gender || null;
    this.mobile = mobile || null;
    this.portrait = portrait || null;
    this.social = social || null;
    this.userId = userId || null;
    this._debug = debug;
    this._unreadTotal = 0; //未读消息总计

    /** from get_user
     address: "aasd2"
      company: "heyu2"
      createTime: 1629163391000
      displayName: "wang2"
      email: "wang2@heyu.com"
      extra: "123"
      gender: 1
      mobile: "13642746944"
      portrait: "123"
      social: "font-end"
      uid: "zjKvXWJU"
      updateDt: 1629163390942
      userId: "wang2"
     */

    this.isTemp = isTemp || false;
  }
  /**
   * 获取未读消息总计
   */
  get unreadTotal() {
    return this._unreadTotal;
  }
  static NewClient(uid, debug) {
    return new Client(uid, debug);
  }
  /**
   * 增加好友
   * @param {*} param0
   * @param {*} socket
   * @param {*} topicMap
   * @returns
   */
  static AddClient({ targetUid, reason, fromsource, detailedDescription, alias, fromTag, targetTag }, socket, topicMap) {
    return socket.send(
      topicMap.ADD_FRIEND({
        targetUid,
        reason,
        fromsource,
        detailedDescription,
        alias,
        fromTag,
        targetTag
      })
    );
  }
  /**
   * 拉黑用户
   * @param {} param0 参考 src\vue_plugin\common\imType\friend.js
   * @param {*} socket
   * @param {*} topicMap
   * @returns
   */
  balckClient({ status }, socket, topicMap) {
    return socket.send(topicMap.BLACK_USER({ targetUid: this.uid, status }));
  }
  deleteClient(socket, topicMap) {
    return socket.send(topicMap.DF({ targetUid: this.uid }));
  }
  /**
   * 设置用户置顶
   * @param {} param0 参考 src\vue_plugin\common\imType\friend.js
   * @param {*} socket
   * @param {*} topicMap
   * @returns
   */
  setTopInList({ status }, socket, topicMap) {
    return socket.send(topicMap.TOP_FRIEND({ targetUid: this.uid, status }));
  }
  getFriendShip(socket, topicMap) {
    return socket.send(topicMap.GFR({ targetUid: this.uid }));
  }
  /**
   * 查询好友拉黑状态
   * @param {} targetUid 好友uid
   * @param {*} socket
   * @param {*} topicMap
   * @returns
   */
  getBlackFriendStatus({ targetUid }, socket, topicMap) {
    return socket.send(topicMap.GET_FRIEND_STATUS({ targetUid }));
  }
  /**
   * 设置别名
   * @param {*} alias
   * @param {*} socket
   * @param {*} topicMap
   */
  setAlias(alias, socket, topicMap) {
    return new Promise(resolve => {
      socket.send(topicMap.ALISA_USER({ targetUid: this.uid, alias })).then(res => {
        if (res) {
          this.alias = alias;
        }
        resolve(res);
      });
    });
  }
  /**
   * 最新的消息
   */
  get lastMessage() {
    if (this.messagesCount > 0) return this.messages[this.messagesCount - 1];
    else return null;
  }
  /**
   * 消息统计
   */
  get messagesCount() {
    return this.messages.length;
  }
  reSeting(obj) {
    this.address = obj.address;
    this.company = obj.company;
    this.createTime = obj.createTime;
    this.displayName = obj.displayName;
    this.email = obj.email;
    this.extra = obj.extra;
    this.gender = obj.gender;
    this.mobile = obj.mobile;
    this.portrait = obj.portrait;
    this.social = obj.social;
    this.uid = obj.uid;
    this.updateDt = obj.updateDt;
    this._unreadTotal = obj._unreadTotal;
  }
  /**
   * 设置、移动消息的指定dt
   * @param {string} dt 消息的Dt
   */
  setLastDt(dt) {
    this.updateDt = dt;
  }
  /**
   * 增加未读消息总计
   */
  addUnread() {
    this._unreadTotal++;
  }
  /**
   * 清零未读消息
   */
  clearUnread() {
    this._unreadTotal = 0;
  }
  addMessage(message, isBaseData = true) {
    const msg = Message.NewMessage(message, isBaseData);
    // !this.messages.some( item => item.dt === msg.message.dt)
    // !this.messages.includes((e) => e.messageId == msg.message.messageId)
    if (!this.messages.some(item => item.dt === msg.message.dt)) {
      this.messages.push(msg);
      this.addUnread();
      this.setLastDt(msg.message.dt);
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
      console.warn("%cadd message is double", this.debug_color);
      return Promise.resolve(this.lastMessage);
    }
  }
  async sortMessages() {
    try {
      this.messages.sort((a, b) => a.dt - b.dt);
      return Promise.resolve(true);
    } catch (err) {
      console.error("sortMessages is error =>" + err);
      return Promise.reject(null);
    }
  }
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
  async loadMessages() {
    try {
      if (window) {
        const data = JSON.parse(window.localStorage.getItem(`client-${this.uid}`));
        if (data) {
          this.messages = [];
          data.forEach(e => {
            this.messages.push(Message.NewMessage(e, false));
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
