import protoCode from "./protoCode";
export default class DataEnter {
  constructor(debug) {
    this._data_pool = null;
    this._subscribeList = []; //{status:0,1  }
    this._debug = debug;
    this.init();
  }
  hasSubscribeIndex(struct_topicMap, context) {
    return this._subscribeList.findIndex(e => e.context == context && e.topic == struct_topicMap);
  }
  /**
   *
   * @param {Number} status 0:临时 1：长期
   * @param {*} topic 类型
   * @param {function} context 返回
   */
  async addSubscribe(struct_topicMap, context, status = 0) {
    const index = this.hasSubscribeIndex(struct_topicMap, context);
    if (index > -1) {
      console.warn("Subscribe has in SubscribeList, update now");
      this._subscribeList[index] = { topic: struct_topicMap.topic, status, context };
    } else this._subscribeList.push({ topic: struct_topicMap.topic, status, context });
    return Promise.resolve();
  }
  setDataPool(data) {
    this._data_pool = data;
  }
  removeSubscribe(struct_topicMap, context) {
    try {
      const index = this.hasSubscribeIndex(struct_topicMap, context);
      if (index < 0) throw new Error("can't fond in List");
      if (this._subscribeList[index].status != 1) this._subscribeList.splice(index, 1);
    } catch (err) {
      console.error("removeSubscribe in dataEnter class is error = > ", err);
    }
  }
  init() {
    const _this = this;
    Object.defineProperty(this, "_data_pool", {
      get: function () {
        // console.warn("can't use getting method");
        return false;
      },
      set: function (value) {
        protoCode.Decoder(value).then(res => {
          const resTopic = res.TOPIC;
          try {
            _this._subscribeList
              .filter(e => e.topic == resTopic)
              .forEach(object => {
                if (object.status) {
                  if (object.context && typeof object.context === "function") object.context(res);
                  else throw new Error("current Object is not function or null in long subscribe list, current Object=>", object);
                } else {
                  const index = _this._subscribeList.findIndex(e => e == object);
                  const current_object = _this._subscribeList.splice(index, 1)[0];
                  if (current_object.context && typeof current_object.context === "function") current_object.context(res);
                  else throw new Error("current Object is not function or null, current Object=>", current_object, "current index is =>", index);
                }
              });
          } catch (err) {
            console.error("err in _data_pool", err);
          }
        });
      }
    });
  }
}
