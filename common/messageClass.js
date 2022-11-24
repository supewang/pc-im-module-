class Message {
  // message:
  // {
  //   cid: "gLprV9Hv",
  //   content: { // MessageContent
  //     content: "111",
  //     mentionedTarget: Array(0),
  //     persistFlag: 1,
  //     searchableContent: "111",
  //     type: 1
  //   },
  //   conversation: { // Conversation
  //     target: "zjKvXWJU"
  //   },
  //   dt: 1629446240080,
  //   fromUser: "gLprV9Hv",
  //   messageId: 3417196441278316500,
  //   seq: 29,
  //   to: Array(0)
  // }
  /**
   *
   * @param {Object} message
   * @param {Boolean} isBaseData 是否直接使用Pullsm的返回数据格式
   */
  constructor(message, isBaseData = true) {
    this.isBaseData = isBaseData;
    if (this.isBaseData) {
      this._message = this.fromatMessage(message);
    } else {
      this._message = message;
    }
    this.content = this._message.content;
    this.from = this._message.from;
    this.to = this._message.to;
    this.type = this._message.type || 1; // content.type
    this.dt = this._message.dt;
    this.messageType = this.setMessageType(this._message.type);
    this.formatByType();
  }

  fromatMessage(message) {
    return {
      from: message.fromUser,
      to: message.conversation.target,
      content: message.content,
      type: message.content.type,
      dt: message.dt
      // messageId: message.messageId,
    };
  }
  formatByType() {
    if (this.TYPE01.includes(this.type)) {
      this.content = this._message.content.content;
      if (this.type == 202) {
        this.content = JSON.parse(this.content).message;
      }
      if (this.type == 207 || this.type == 223) {
        this.content = this.replaceString(this._message.content.searchableContent);
      }
      return;
    }
    if (this.content.content && this.type == 1) {
      this.content = this._message.content.content;
      return;
    }
    if (this.otherType.includes(this.type)) {
      this.content = this._message.content.content && JSON.parse(this._message.content.content);
      return;
    }
    if (this.content.remoteMediaUrl) {
      const fileType = this.getFileType(this.content.remoteMediaUrl);
      // this.content = {
      //   filetype,
      //   mediaUrl: this.fileViewHost + "/" + this.content.remoteMediaUrl,
      // };
      this.content = {
        fileType,
        mediaUrl: this.content.remoteMediaUrl
      };
      return;
    }
  }
  replaceString(val) {
    return val ? val.replace(/\[|]/g, "") : "";
  }
  getFileType(filesName) {
    try {
      const fileTypeString = filesName.split(".").pop();
      const typeIndex = this.fileType.findIndex(e => e.include.includes(fileTypeString));
      if (typeIndex > -1) {
        return this.fileType[typeIndex].value;
      } else {
        console.log("%cfile type can't find in list", this.debug_color);
        return -1;
      }
    } catch (error) {
      console.error(error);
      return -1;
    }
  }
  get debug_color() {
    return "color:white:background:blue;";
  }
  get fileType() {
    return [
      { name: "图片", value: 1, include: ["jpg", "gif", "png"] },
      { name: "视频", value: 2, include: ["mp4"] },
      { name: "音频", value: 3, include: ["mp3"] },
      { name: "文件", value: 4, include: ["zip", "pdf", "txt", "rar"] }
    ];
  }
  get TYPE01() {
    return [107, 108, 117, 202, 206, 201, 207, 208, 209, 211, 213, 215, 216, 218, 220, 221, 223]; // 131:解除禁言
  }
  get otherType() {
    return [104, 106, 118, 105, 127, 128, 200, 131, 132, 203, 210, 300, 303];
  }
  setMessageType(val) {
    let types = [
      {
        key: 1,
        cssType: 1,
        name: "文本",
        showArias: true
      },
      {
        key: 2,
        cssType: 1,
        name: "语音",
        showArias: true
      },
      {
        key: 3,
        cssType: 4,
        name: "图片",
        showArias: true
      },
      {
        key: 5,
        cssType: 1,
        name: "文件",
        showArias: true
      },
      {
        key: 6,
        cssType: 4,
        name: "视频",
        showArias: true
      },
      {
        key: 104,
        cssType: 2,
        name: "创建群",
        showArias: false
      },
      {
        key: 105,
        cssType: 2,
        name: "加入群员",
        showArias: false
      },
      {
        key: 106,
        cssType: 2,
        name: "被踢",
        showArias: false
      },
      {
        key: 107,
        cssType: 2,
        showArias: false
      },
      {
        key: 108,
        cssType: 2,
        showArias: false
      },
      {
        key: 117,
        cssType: 2,
        name: "设置管理员",
        showArias: false
      },
      {
        key: 118,
        cssType: 2,
        name: "单人禁言通知类型",
        showArias: false
      },
      {
        key: 127,
        cssType: 1,
        name: "通话取消",
        showArias: true
      },
      {
        key: 128,
        cssType: 1,
        name: "通话结束",
        showArias: true
      },
      {
        key: 131,
        cssType: 2,
        name: "单人解除禁言类型",
        showArias: false
      },
      {
        key: 132,
        cssType: 1,
        name: "推荐名片",
        showArias: true
      },
      {
        key: 200,
        cssType: 4,
        name: "问诊单",
        showArias: true
      },
      {
        key: 201,
        cssType: 3,
        name: "居民确认问诊",
        showArias: false
      },
      {
        key: 202,
        cssType: 3,
        name: "问诊结束",
        showArias: false
      },
      {
        key: 203,
        cssType: 4,
        name: "医嘱单",
        showArias: true
      },
      {
        key: 204,
        cssType: 3,
        name: "问诊结束",
        showArias: false
      },
      {
        key: 205,
        cssType: 6,
        name: "患者评价",
        showArias: false
      },
      {
        key: 206,
        cssType: 6,
        name: "开始问诊",
        showArias: false
      },
      {
        key: 207,
        cssType: 2,
        name: "医生禁言",
        showArias: false
      },
      {
        key: 208,
        cssType: 6,
        name: "医生开始问诊",
        showArias: false
      },
      {
        key: 209,
        cssType: 1,
        name: "居民未答应",
        showArias: true
      },
      {
        key: 210,
        cssType: 2,
        name: "超时",
        showArias: false
      },
      {
        key: 211,
        cssType: 2,
        name: "居民已过号",
        showArias: false
      },
      {
        key: 213,
        cssType: 1,
        name: "居民已拒绝",
        showArias: true
      },
      {
        key: 215,
        cssType: 1,
        name: "[居民无就诊且预约结束时间内未通知医生问诊，自动结束问诊]",
        showArias: true
      },
      {
        key: 216,
        cssType: 3,
        name: "[问诊时长不限制提醒]",
        showArias: false
      },
      {
        key: 218,
        cssType: 1,
        name: "已经开始问诊",
        showArias: true
      },
      {
        key: 220,
        cssType: 1,
        name: "健康档案待授权",
        showArias: true
      },
      {
        key: 221,
        cssType: 1,
        name: "健康档案已授权",
        showArias: true
      },
      {
        key: 223,
        cssType: 1,
        name: "超过预约结束时间设置居民无就诊，问诊结束",
        showArias: true
      },
      {
        key: 300,
        cssType: 2,
        name: "医生发起音频通话",
        showArias: false
      },
      {
        key: 303,
        cssType: 2,
        name: "群聊通话结束",
        showArias: false
      }
    ];
    let value = types.filter(t => t.key == val)[0] || {};
    return value;
  }
  get fileViewHost() {
    return Message._fileViewHost;
  }
  get message() {
    return this._message;
  }
  get isNotice() {
    return this.TYPE01.includes(this.type);
  }
  get isMedia() {
    return this._message.content.remoteMediaUrl ? true : false;
  }
  static NewMessage(message, isBaseData) {
    return new Message(message, isBaseData);
  }
}

export { Message };
