import topicData from "../imType/index";
// 创建对应的消息类
class Topic {
  constructor(topicType, sendType, resType, debug) {
    this.topicType = topicType;
    this.sendType = sendType;
    this.resType = resType;
    this._dataArray;
    this._debug = debug;
  }
}
class TopicList {
  constructor(typeList, debug) {
    this.topicData = typeList;
    // 创建消息解析模板
    this.topicMap = new Map();
    this._debug = debug;
    this.init();
  }
  // 初始化消息解析模板队列
  init() {
    let topicData = this.topicData;
    const _this = this;
    Object.keys(topicData).forEach(function (key) {
      if (_this.topicMap.has(topicData[key].topic)) console.warn("current topic is duplicate,current topic name:", topicData[key].topic);
      else _this.topicMap.set(topicData[key].topic, new Topic(topicData[key].topic, topicData[key].type[0], topicData[key].type[1], _this._debug));
      _this[topicData[key].topic] = topicData[key].method;
      _this["GET" + topicData[key].topic] = topicData[key].result;
    });
  }
  topicType(topic) {
    return this.topicMap.get(topic).topicType;
  }
  sendType(topic) {
    return this.topicMap.get(topic).sendType;
  }
  resType(topic) {
    return this.topicMap.get(topic).resType;
  }
  getTopicData(topic) {
    return this.topicMap.get(topic);
  }
}

const topiclist = new TopicList(topicData, false);
// topiclist.init();
const topicMap = topiclist;

export { topiclist, topicMap };
