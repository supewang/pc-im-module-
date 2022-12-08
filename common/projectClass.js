import { getTemporaryUrlList } from "./api/upload.js";
import User from "./userClass";
import BaseUser from "./baseUserClass";
import ImSocket from "./base/socket";
import configData from "./base/configData";
import { Group } from "./groupClass";
import axios from "axios";
import restApi from "./api/index";
import RestApiReqeust from "./base/request";
import { Console } from "./base/Console";
// const na = navigator.userAgent.toLowerCase()
// const TRTCCalling = require("trtc-calling-js");
// import {Message} from "./messageClass";

class Project {
  constructor(args) {
    this.applicationId = args.applicationId; //"faad83a97ccd39c0c1336ca75f95a0df";
    this.applicationSecret = args.applicationSecret; //"junyou";
    this.initWsUrl = args.initWsUrl || "";
    this.granType = args.granType; //"applicationCredentials";
    this.fileUploadHost = args.fileUploadHost || ""; //  /pub/file/upload
    this.fileViewHost = args.fileViewHost || ""; //"https://junyou-1258342435.cos.ap-guangzhou.myqcloud.com";
    this.websocketPath = args.websocketPath; //https协议下wss的地址
    this._evn = args.evn;
    this.accessToken = null;
    this.expiresIn = null;
    this.socket = null;
    this.configData = configData;
    this._wshost = null; //gateway ip/域名
    this._wsProt = null; //  websocket端口
    this._wspath = "/ws";
    this._balance = null; //websocket负载
    this._restApiPath = args.restApiPath; // "/hyjkim-webapp/im"
    this._restHost = args.restHost; // http api 接口host
    this._debug = args.debug || false;
    this._user = null; // 用户对象
    this._request = Project.InitRequest(this._restHost, this._restApiPath, this._evn);
    User._parent = this;
    Group._parent = this;
    ImSocket._parent = this;
    new Console(this._debug);
    this.trtcCalling = null; //腾讯视音频TRTCCalling
    this._ssl = args.ssl || false; //是否加密协议
  }
  set user(val) {
    // Console.warn("can't set value by this method");
  }
  get user() {
    return this._user;
  }
  get wsurl() {
    return this.initWsUrl || (this._ssl ? this.websocketPath : `ws://${this._wshost}:${this._wsProt}${this._wspath}`);
  }
  get apiurl() {
    return this._restHost + this._restApiPath;
  }
  get restApi() {
    return restApi;
  }
  http(APIOJB, data, IsMock = null) {
    if (this._request) return this._request.http(APIOJB, data, IsMock);
    else Console.warn("request isn't initialize");
  }
  setUser(val) {
    this._user = val;
  }
  static InitRequest(host, basePath, evn) {
    return new RestApiReqeust({ host, basePath, evn });
  }
  baseSettings() {
    return new Promise(resolve => {
      this.getWebScoketSettings()
        .then(settings => {
          if (settings) {
            // 1初始化Project的socket链接
            return this.getAccessToken();
          } else {
            resolve(false);
          }
        })
        .then(statusAccessToken => {
          if (statusAccessToken) resolve(true);
          else resolve(false);
        });
    });
  }
  getWebScoketSettings() {
    return new Promise(resolve => {
      this.http(this.restApi.GATEWAY)
        .then(({ data }) => {
          this._wshost = data.host;
          this._wsProt = data.wsPort;
          this._balance = data.balance;
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  // 获取Token和expiress 并写到localStorage的accessToken=>Authorization expiresIn=>expiress
  getAccessToken() {
    const param = {
      granType: this.granType,
      applicationId: this.applicationId,
      applicationSecret: this.applicationSecret
    };
    return new Promise(resolve => {
      this.http(this.restApi.ACCESSTOKEN, param)
        .then(({ data }) => {
          this.accessToken = data.accessToken;
          this.expiresIn = new Date(data.expiresIn);
          this._request.setAuthorization(this.accessToken, this.expiresIn);
          if (this._evn != 1 && window) {
            localStorage.setItem("Authorization", this.accessToken);
            localStorage.setItem("expiress", this.expiresIn);
          }
          if (this._evn == 1) {
            localStorage.setItem("Authorization", this.accessToken);
            localStorage.setItem("expiress", this.expiresIn);
            // wx.setStorageSync("Authorization", this.accessToken);
            // wx.setStorageSync("expiress", this.expiresIn);
          }
          resolve(true);
        })
        .catch(err => {
          Console.error(err);
          resolve(false);
        });
    });
    // try {
    //   const { data } = await this.http(this.restApi.ACCESSTOKEN, param);
    //   this.accessToken = data.accessToken;
    //   this.expiresIn = new Date(data.expiresIn);
    //   this._request.setAuthorization(this.accessToken, this.expiresIn);
    //   localStorage.setItem("Authorization", this.accessToken);
    //   localStorage.setItem("expiress", this.expiresIn);

    //   const finishSocket = await this.initSocket();
    //   if (finishSocket == false) {
    //     Console.error("scoket is failed");
    //   }
    //   return Promise.resolve(this);
    // } catch (err) {
    //   return Promise.resolve(null);
    // }
  }
  //初始化websocket
  initSocket() {
    return new Promise(resolve => {
      ImSocket.createSocket(this.wsurl, this._debug)
        .then(socket => {
          if (socket == null) {
            Console.error("socket create is failed in Project class");
            resolve(false);
          } else {
            this.socket = socket;
            resolve(true);
          }
        })
        .catch(err => {
          console.error("initSocket in project class err =>", err);
          resolve(false);
        });
    });
  }
  recontenct() {
    if (this._user) {
      this._user.longSocketAuth();
    }
  }
  /**
   *
   * @param {*} imUser
   * @returns promise
   */
  loginUser(imUser, T = User) {
    return new Promise(resolve => {
      T.Login(imUser, T).then(user => {
        if (user) {
          this._user = user;
          this.user.setUserSiging().then(() => {
            resolve(this.user);
          });
          // resolve(this.user);
        }
      });
    });
  }
  registerUser({ userId, mobile, passwd, gender, applicationId }, T = User) {
    return T.Register({ userId, mobile, passwd, gender, applicationId });
  }
  /**
   * 上传文件
   * @param {File Object} file
   * @returns
   */
  upload(file) {
    let data = new FormData();
    data.append("file", file);
    data.append("storageWay", 4);

    return new Promise((resolve, reject) => {
      axios({
        url: this.fileUploadHost + "/pub/file/upload",
        method: "post",
        data,
        headers: { "Content-Type": "multipart/form-data" }
      })
        .then(res => {
          if (res.data.errcode == 0) {
            // reutrn data format etc:
            // fileId: "cb2d99946bb4459791908175ffd37bc3"
            // filePath: "c89e42bdeda04084b0af763e84e8f06e.jpg"
            // fileSuffix: "jpg"
            // fileType: 3
            // originalName: "qrcode.jpg"
            // size: 102566
            // resolve(this.fileViewHost + "/" + res.data.data.filePath);
            resolve(res.data.data);
          } else {
            Console.error("res.data.errmsg =>", res.data.errmsg);
            reject(null);
          }
        })
        .catch(err => {
          Console.error("res =>", err);
          reject(null);
        });
    });
  }
  /**
   * 下载文件
   * @param {*} list {key:filepath}
   * @returns
   */
  getTemporaryUrlList(list) {
    if (list.length > 0) return getTemporaryUrlList(list);
    else Promise.resolve(null);
  }
  //初始化TrtcCalling
  intiTrtcCalling() {
    return new Promise(resolve => {
      this.user.setUserSiging().then(data => {
        // this.trtcCalling = new TRTCCalling({
        //   SDKAppID: data.appId
        // });
        resolve(data);
      });
    });
  }
}
export { Project, User, BaseUser };
// module.exports = Project;
