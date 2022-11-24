import protoRoot from "../../proto/proto";
const fontNestedString = "com.hyjkim.common.protobuf";
const prototType = {
  PUBLISHMESSAGE: {
    lable: "PublishMessage",
    // com: "com.nested.***********.PublishMessage",
    com: fontNestedString + ".PublishMessage",
  },
  getObject(type) {
    try {
      if (type) {
        return protoRoot.lookup(type);
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  },
};

export default prototType;
