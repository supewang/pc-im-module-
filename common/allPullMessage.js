/**
 * 存储PullSM的所有消息
 */

export default class AllMessage {
  constructor(args) {
    this._allMessageList = [];
  }

  static createdAllMessage(list) {
    return new AllMessage(list);
  }

  set allMessageList(data) {
    this._allMessageList = data;
  }

  get allMessageList() {
    return this._allMessageList;
  }

  reduceMessage(id, Tclass = null, isGroup = true) {
    if (Tclass) {
      let messageList = this.allMessageList.filter(group => group.conversation.target == id);
      messageList.forEach(msg => {
        Tclass.addMessage(msg);
      });
    }
  }
}
