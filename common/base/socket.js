import protoCode from "./protoCode";
const { topicMap } = require("./TypeMap");
// if (topicMap.topiclist) {
//   topicMap = topicMap.topiclist;
// }
import DataEnter from "./dataEnter";
class ImSocket {
  constructor(url, debug) {
    this.url = url;
    // this.protorol = protorol;
    this.connection = null;
    this.pingpongTimeout = 55000; //55000; 心跳时间间隔 ms
    this.handlers = {};
    // this._resMesg = new SockMessage(this);
    this._filedomain = null;
    this.reConnectTime = 3; // 重连次数
    this.reConnectBypingpongTime = 1; // 心跳允许连续停跳次数，
    this.PMN = null; // project { callback , class }
    this.Interval = null; //pingpong的时间Handle
    this.disConnectTimeCounter = 0; //
    this.currentResolve = null;
    this.sendCache = [];
    this.timeOut = 20000; // 返回信息超时
    this.timeOutHandle = null;
    this._hasLongSocketAuth = false; // 长链状态
    this._dataEnter = null;
    this._debug = debug;
    this.debug_color = "color:white; background:orange; padding:0 6px";
    this.reConnectPolicyData = {
      autoLoopSend: false, // 重连后是否自动重复
      longSocketAuthTimes: 3 //长链接联系失败次数
    };
  }
  get user() {
    return ImSocket._parent.user;
  }
  get isOpen() {
    if (this.connection) {
      if (this.connection.readyState == 0) {
        console.log("%cCONNECTING", this.debug_color);
        return false;
      }
      if (this.connection.readyState == 1) {
        console.log("%cOPEN", this.debug_color);
        return true;
      }
      if (this.connection.readyState == 2) {
        console.log("%cCLOSING", this.debug_color);
        return false;
      }
      if (this.connection.readyState == 3) {
        console.log("%cCLOSED", this.debug_color);
        return false;
      }
    }
    return false;
  }
  /**
   * socket的链接状态
   */
  get readyState() {
    return this.connection ? this.connection.readyState : null;
  }
  /**
   * 长链接的状态
   */
  get longAuth() {
    return this._hasLongSocketAuth;
  }
  //长链接获取的文件传输域名：
  set filedomain(val) {
    this._filedomain = val;
  }
  get filedomain() {
    return this._filedomain;
  }
  static createSocket(url, debug) {
    const t = new ImSocket(url, debug);
    // eslint-disable-next-line no-unused-vars
    return t.socketConnect();
  }
  async socketConnect() {
    const t = this;
    return new Promise((resolve, reject) => {
      try {
        if (ImSocket._parent._evn == 1) {
          t.connection = wx.connectSocket({
            url: t.url
          });
        } else {
          console.log(t.url, "---WebSocket");
          t.connection = new window.WebSocket(t.url);
        }
        if (!t.connection) {
          t.reConnectTime = 0; // 不在重连
          throw new Error("浏览器不支持");
        } else {
          t.connection.onopen = function () {
            console.log("socket open");
            t.reConnectTime = 3;
            // t.pingpong(); // 心跳，55s 维持长链接 60s闲置就回断
            t._dataEnter = new DataEnter(t._debug);
            if (ImSocket._parent._evn == 1) {
              t.connection.readyState = 1;
            }
            resolve(t);
          };
          t.connection.onclose = function (e) {
            console.warn("%csocket is close", t.debug_color, e);
            // console.warn("%csocket is close", t.debug_color, e);
            t.reconnect();
          };
          t.connection.onmessage = function (e) {
            // console.log("获取消息", e);
            if (e.data) {
              t._dataEnter.setDataPool(e.data);
              // t._resMesg.messageData = e.data;
            } else {
              // console.warn("return data from socket haven't data object =>", e);
              console.warn("return data from socket haven't data object =>", e);
            }
          };
          t.connection.onerror = function (e) {
            // console.log("error in socket connection =>", e);
            console.log("error in socket connection =>", e);
            t.Interval && clearInterval(t.Interval);
          };
          // return Promise.resolve(t);
        }
        if (ImSocket._parent._evn == 1) {
          t.connection.onOpen(t.connection.onopen());
          t.connection.onClose(e => t.connection.onclose(e));
          t.connection.onMessage(e => t.connection.onmessage(e));
          t.connection.onError(e => t.connection.onerror(e));
        }
      } catch (err) {
        // console.error(err);
        console.error(err);
        reject(null);
      }
    });
  }
  closeSocket() {
    this.Interval && clearInterval(this.Interval);
    this.reConnectTime = 0;
    return this.connection.close();
  }
  /**
   * 暴露给vue的标准方法
   * @param {} struct_topicMap
   * @param {*} context
   * @returns
   */
  sendSocket(struct_topicMap, context = null) {
    return this.send(struct_topicMap, context, false);
  }
  /**
   * 发送消息
   * @param {*} obj  参数
   * @param {*} context 上下文 {callback}
   * @param {*} isformat 是否格式化，满足其他架构的二次封装
   * @returns promise.resolve true /false data 如果context=null,返回 data
   */
  async send(struct_topicMap, context = null, isformat = true) {
    if (this.isOpen == false) {
      throw new Error("isOpen is false in socket Class");
    }
    const resultPromise = new Promise(resolve => {
      this._dataEnter
        .addSubscribe(struct_topicMap, resolve)
        .then(() => {
          return protoCode.Encode(struct_topicMap);
        })
        .then(res => {
          if (ImSocket._parent._evn != 1) this.connection.send(res);
          else if (ImSocket._parent._evn == 1) {
            this.connection.send(res);
          }
          this.timeOutHandle = setTimeout(() => {
            this._dataEnter.removeSubscribe(struct_topicMap, resolve);
            throw new Error("waiting data is time out ");
          }, this.timeOut);
        })
        .catch(err => {
          resolve({
            errorCode: 400001,
            errorMsg: err
          });
        });
    });
    const result = await resultPromise;
    this.timeOutHandle && clearTimeout(this.timeOutHandle);
    const statusPolicy = await this.reConnectPolicy(result.errorCode);
    if (statusPolicy) {
      //再次发送
      if (this.reConnectPolicyData.autoLoopSend == true) return this.send(struct_topicMap, context, isformat);
      // 不重发送
      else
        return Promise.resolve({
          errorCode: result.errorCode,
          errorMsg: result.errorMsg
        });
    }
    if (isformat) {
      const formatData = topicMap["GET" + result.TOPIC](result, context);
      return Promise.resolve(formatData);
    } else {
      if (result.payload)
        return Promise.resolve({
          errorCode: result.errorCode,
          errorMsg: result.errorMsg,
          data: {
            messageType: result.messageType,
            packetid: result.packetid,
            ...result.payload
          }
        });
      else
        return Promise.resolve({
          errorCode: result.errorCode,
          errorMsg: result.errorMsg
        });
    }
  }
  addLongSubscribe(topicMap, context) {
    this._dataEnter.addSubscribe(topicMap, context, 1);
  }
  pingpong() {
    this.Interval = setInterval(() => {
      const param = {
        topic: "PING",
        data: {
          packetid: "ping"
        }
      };
      this.send(param).then(res => {
        // 1次失败就重连
        if (res == false) {
          this.reConnectBypingpongTime = this.reConnectBypingpongTime - 1;
        }
        if (this.reConnectBypingpongTime < 1) {
          this.reconnect();
        }
      });
    }, this.pingpongTimeout);
  }
  /**
   * 停止心跳
   */
  stopPingpong() {
    this.Interval && clearInterval(this.Interval);
  }
  /**
   * 重启心跳
   * @param {Number} heartbeatInterval 心跳间隔 s
   */
  reStartPingpong(heartbeatInterval) {
    // eslint-disable-next-line no-unused-vars
    const Interval = Number(heartbeatInterval) * 1000;
    this._hasLongSocketAuth = true;
    this.stopPingpong();
    this.pingpong(this.pingpongTimeout);
  }
  /**
   * 重连socket链路
   */
  async reconnect() {
    this.disConnectTimeCounter++;
    this.stopPingpong();
    // this.reConnectTime--; // 重连累计-1
    const reconnectInterval = 1000; // 重新开始websocket的延时时间
    if (this.reConnectTime > 0) {
      return new Promise(resolve => {
        if (this.connection.readyState < 2) this.closeSocket();
        setTimeout(() => {
          this.socketConnect()
            .then(res => {
              return res.user.longSocketAuth();
            })
            .then(data => {
              this.reStartPingpong(data.heartbeatInterval);
              resolve(true);
            });
        }, reconnectInterval);
      });
    } else {
      // console.error("Class socket connected times over " + this.reConnectTime);
      console.error("Class socket connected times over " + this.reConnectTime);
      return Promise.resolve(false);
    }
  }
  /**
   * 重连策略
   * @param {String} errorCode 出错代码
   */
  async reConnectPolicy(errorCode) {
    if (["101005", "101006", "101007"].includes(errorCode)) {
      this._hasLongSocketAuth = false;
      const status = await this.reconnect();
      return Promise.resolve(status);
    }
    if (["101003"].includes(errorCode)) {
      this._hasLongSocketAuth = false;
      const status = await this.user.longSocketAuth();
      return Promise.resolve(status);
    }
    return Promise.resolve(false);
  }
}

export default ImSocket;
