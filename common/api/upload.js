import request from "../base/request";

//上传文件
export function upload(formData) {
  return request({
    url: "/file/upload",
    method: "post",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" }
  });
}

//获取文件下载
export function getTemporaryUrlList(data) {
  return request({
    url: "/file/getTemporaryUrlList",
    method: "post",
    data
  });
}

//获取文件 base64
export function getDownLoadToBase(data) {
  return request({
    url: "/file/downloadToBase64",
    method: "post",
    data
  });
}
