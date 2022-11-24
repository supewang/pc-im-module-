import axios from "axios";

import mpAdapter from "axios-miniprogram-adapter";
// axios.defaults.adapter = mpAdapter
export default class RestApiReqeust {
  constructor({ host, basePath, evn, token = null, expiress = null, timeout = 20000 }) {
    this._host = host;
    this._basePath = basePath;
    this._token = token;
    this._expiress = expiress;
    this._timeout = timeout;
    this._expectedTokenList = [];
    this._request = null;
    this._evn = evn;
    this.init();
    // this._evn == 2 && this.init();
    // this._evn == 1 && this.initMini();
  }
  setAuthorization(token, expiress) {
    this._token = token;
    this._expiress = expiress;
  }
  // initMini() {
  //   this._request = (config) => {

  //     let base = {
  //       url: this._host + this._basePath + config.url,
  //       timeout: this._timeout,
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": this._token
  //       }
  //     }
  //     if (config.method.indexOf(",mock") > -1) {
  //       const method = config.method.replace(",mock", "");
  //       config.method = method;
  //       process.env.NODE_ENV != "production" && (config.baseURL = "/mock");
  //     }
  //     return new Promise((resolve, reject) => {
  //       wx.request({
  //         ...base,
  //         success(response) {
  //           if (response.data.code == 1) {
  //             resolve(response.data);
  //           } else {
  //             reject(response.data.msg);
  //           }
  //         },
  //         fail(err) {
  //           return reject(err);
  //         }
  //       })
  //     })
  //   }
  // }
  init() {
    this._evn == 1 && (axios.defaults.adapter = mpAdapter);
    this._request = axios.create({
      baseURL: this._host + this._basePath,
      timeout: this._timeout,
      headers: {
        "Content-Type": "application/json"
      }
    });
    this._request.interceptors.request.use(
      config => {
        if (config.method.indexOf(",mock") > -1) {
          const method = config.method.replace(",mock", "");
          config.method = method;
          process.env.NODE_ENV != "production" && (config.baseURL = "/mock");
        }
        config.headers["Authorization"] = this._token;
        config.headers["Jwt-Authorization"] = this._token;
        return config;
      },
      error => {
        console.error(error);
        return Promise.reject(null);
      }
    );

    this._request.interceptors.response.use(
      response => {
        return new Promise((resolve, reject) => {
          if (response.data.code == 1 || response.data.errcode == 0) {
            resolve(response.data);
          } else {
            reject(response.data.msg || response.data.errmsg);
          }
        });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }
  http(APIOJB, data, IsMock = null) {
    const isMocktoBool = IsMock == "mock" ? true : false;
    let UrlObj = APIOJB;
    if (isMocktoBool && APIOJB.method.indexOf(",mock") < 0) {
      UrlObj.method = `${APIOJB.method},mock`;
    }
    if (APIOJB.method.indexOf("post") > -1) {
      UrlObj.data = data;
    } else {
      UrlObj.params = data;
    }
    return this._request(UrlObj);
  }
}
