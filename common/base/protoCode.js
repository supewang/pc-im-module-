/* eslint-disable no-unused-vars */

import protoRoot from "../../proto/proto";
import { ByteBuffer } from "./buf.js";
import { topiclist } from "./TypeMap";
import "fast-text-encoding";
import prototType from "./protoType";
let utf8decoder = new TextDecoder();

const TOPIC_BYTES = 2;
const MESSAGE_BYTES = 2;
const debug_color = "color:#0095ff;background:#e4f4f8";
const debug_color2 = "color:#0e9000;background:#e8fae6";
const protoCode = {
  Encode: function (obj, type = null) {
    if (!type) {
      type = prototType.PUBLISHMESSAGE.com;
    }
    return new Promise((resolve, reject) => {
      try {
        // const messageContent = protoRoot.lookup("com.nested.***********.PublishMessage")
        // const packetTopic = topiclist.topicMap.get(obj.topic);
        const packetTopic = topiclist.getTopicData(obj.topic);
        // if (packetTopic.sendType && packetTopic.sendType != "") {
        if (packetTopic.sendType && packetTopic.sendType != "") {
          const root = protoRoot;
          let lookupMessage = root.lookup(type);
          const lookupPayloadMessage = root.lookup(`com.hyjkim.common.protobuf.${packetTopic.sendType}`);
          let PayloadClassT = lookupPayloadMessage.create(obj.data.payload);
          let bufPayload = lookupPayloadMessage.encode(PayloadClassT).finish();

          //总数据 buffer
          let topic = obj.topic;
          let buf = this.bufferData(topic, obj, lookupMessage, bufPayload);

          resolve(buf);
        } else {
          //总数据 buffer
          let topic = obj.topic;
          let buf = this.bufferData(topic, obj, "", "");
          resolve(buf);
        }
      } catch (err) {
        console.log("EncodeProto-eror", err);
        resolve(null);
      }
    });
  },
  bufferData(topic, obj, messageContent, bufPayload) {
    /**
     * 数据总长度   4byte
     * TOPIC长度    2byte
     * TOPIC内容    topic
     * 消息类型     2byte
     * 数据体       data body
     */
    let reqMsg = new ByteBuffer();
    // 需要把 内容转成 Buffer,然后需要放在 payload
    obj.data.payload = bufPayload ? bufPayload : "";
    let buffer;
    if (messageContent != "") {
      let ClassT = messageContent.create(obj.data);
      buffer = messageContent.encode(ClassT).finish();
    }

    //topic 长度
    const topicLength = this.bytesArr(topic, "utf8");
    reqMsg.short(topicLength.length);
    //topic 内容
    reqMsg.byteArray(this.bytesArr(topic, "utf8"), topicLength.length);
    //消息类型
    reqMsg.short(1);
    //payload data数据
    if (messageContent != "") {
      reqMsg.byteArray(buffer, buffer.length);
    }
    // 数据体的长度
    let dataLength = reqMsg.blength();
    reqMsg.int32(dataLength, 0);

    let buf = reqMsg.pack();
    // console.log("发送的总数据---:", buf);
    return buf;
  },
  bytesArr(str, encoding) {
    String.prototype.toBytes = function (encoding) {
      var bytes = [];
      var buff = new Buffer(this, encoding);
      for (var i = 0; i < buff.length; i++) {
        var byteint = buff[i];
        bytes.push(byteint);
      }
      return bytes;
    };
    var bytes = str.toBytes(encoding);
    //校验正确性
    // console.log("校验正确性:", Buffer.from(bytes).toString(encoding));
    return bytes;
  },
  Decoder: async function (data) {
    try {
      if (!data) {
        throw new Error("input data is ", data);
      }
      // data.arrayBuffer().then((res) => {
      const res = await data.arrayBuffer();
      const bytebuf = new ByteBuffer(res);
      //解包 数据长度 类型 buf
      const dataLength = bytebuf.int32().unpack();
      //解包 topic 长度  类型 buf
      const topicLength = bytebuf.short().unpack();
      //解包 topic 内容  类型 buf
      const topic = bytebuf.byteArray(null, topicLength[1]).unpack();
      let TOPIC = utf8decoder.decode(topic[2]);
      //解包 message 类型  类型 buf   1 是服务端主动发  2 是返回
      const messageType = bytebuf.short().unpack()[3];
      // 计算payload 取值的位置
      let bodyLength = dataLength[0] - TOPIC_BYTES - topicLength[1] - MESSAGE_BYTES;
      //解包 payload 类型 buf
      let dataBody = bytebuf.byteArray(null, bodyLength).unpack();
      console.log("%ccurrent TOPIC [value => " + TOPIC + "] in Decoder function ", debug_color);
      //messageType 1 是服务端主动发  2 是返回
      const getTopicData = topiclist.getTopicData(TOPIC);
      const DecodeData = this.messageData(messageType, dataBody, getTopicData);
      // console.log("解码的数据DecoderProto=>", DecodeData);
      return Promise.resolve(DecodeData);
    } catch (err) {
      console.log("DecoderProto-eror", err);
      return Promise.resolve(null);
    }
  },

  //判断是服务端主动还是 返回
  messageData(messageType, dataBody, Topic) {
    if (topiclist.topicMap.has(Topic.topicType)) {
      let type = Topic.resType;
      if (Topic.topicType === "SM") {
        messageType === 1 && (type = "Message");
      }

      const data = this.DecodeProto(messageType, dataBody, type, Topic);
      // if (Topic.topicType === "PMN") {
      //   const param = topiclist.PULLSM({
      //     // type: 0,
      //     seq: data.payload.seq,
      //   });
      //   // SockMessage.Init()中处理
      //   return param;
      // }
      return data;
    } else {
      return null;
    }
  },
  DecodeProto(messageType, dataBody, type, Topic) {
    const message = protoRoot.lookup(`com.hyjkim.common.protobuf.${messageType == 1 ? "PublishMessage" : "PublishAckMessage"}`);

    // 解码最外层的真实数据
    const DecodeData = message.decode(dataBody[4]);
    console.log("%c解码最外层的真实数据", DecodeData);

    if (Object.keys(DecodeData.payload).length != 0) {
      const messagePayload = protoRoot.lookup(`com.hyjkim.common.protobuf.${type}`);
      // 解压Payload的内容
      const DecodePayload =!type ? {} : messagePayload.decode(DecodeData.payload);
      DecodeData.payload =  { ...DecodePayload };
      DecodeData.messageType = messageType;
      DecodeData.TOPIC = Topic.topicType;
      return DecodeData;
    } else {
      DecodeData.TOPIC = Topic.topicType;
      DecodeData.payload = null;
      return DecodeData;
    }
  }
};

export default protoCode;
