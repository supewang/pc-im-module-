#### demo in vue

http://192.168.120.49:9980/panyongjian/imsystem.git
master

#### imsys 接口说明

#

# 注意：

1.所有对象有“\_”的变量不能直接赋值修改
2.websocket 接口请查考 “IM 对接文档.docx” （后端提供）

## 1 初始化：创新项目对象 new Project(object)

参数
object:{
applicationId 项目 ID
applicationSecret 项目密钥
granType this.granType,
fileUploadHost 上传接口的域名 最后不带“/”
fileViewHost 预览图片的域名 最后不带“/”
wsurl websocket 的域名:端口
debug 是否开启调试模式，默认 false
}
成功：Project 对象 失败：null

# 3 注册用户

project.registerUser({userId, mobile, passwd, gender, applicationId})
参数
userId,
mobile,
passwd,
gender,
applicationId

返回：
true： 成功； false：失败

# 2 用户登录

project.loginUser(userId)
参数
userId: String 用户的 UserId

返回
成功：User 对象 失败：null

说明：成功登录后，project.user 将保存成功登录的用户信息对象，project.socket 将保存成功认证的长连接对象

## 2.User 对象接口

user.logout()
方法:用户登出
返回：Promise 对象，成功：true 失败：false

user.getUserByUids(uids)
获取用户资料
参数：uids Array
返回： Promise 对象，resolse=>Array 失败返回空数组 []

user.setUserByUids(paramObject,valueObject)
方法： 设置用户资料
参数：IM 对接文档.docx 关键字：“UPDATE_USER”
例子参考 settings.vue

user.initClientList()
方法：获取用户好友列表

user.deleteMessage(targetUid)
方法：删除消息
参数：targetUid uid/gid
说明：M 对接文档.docx 关键字：“DM”

user.sendMessage(object)
方法：发送消息
参数：object：{ conversation, content, toUser, toList, isGroup , isFriend }
toUser：私聊目标用户
toList：群聊目标群
isGroup：boolean 发送目标是群组
isFriend: boolean 发送目标是私聊

说明：IM 对接文档.docx 关键字：“SM”
备注：isGroup 和 isFriend 默认值为 false,但使用此方法，isGroup 和 isFriend 必须有一个是 true

user.searchClients(object)
方法：搜索用户（服务器）
参数：object：{ keyword, fuzzy }
说明：IM 对接文档.docx 关键字：“SEA_USER”

user.addClient(object)
方法：申请加好友
参数：object：{ argetUid, reason, fromsource }
说明：IM 对接文档.docx 关键字：“ADD_FRIEND”

user.blackClientByUid(uid, status)
拉黑、删除用户
参数：uid, status
uid Uid
status: 状态字典
说明：IM 对接文档.docx 关键字：“BLACK_USER”

user.getClientByUid(uid)
获取本地的用户
参数：uid, status
uid Uid
status: 状态字典
返回 成功：client 对象 失败：null

user.getClientRequestList(update_dt = 0)
查询那些用户请求添加的消息列表
参数：update_dt 时间节点，详细问后端，默认全查
返回 返回请求的数组

user.handleClientByObj({ targetUid, fromsource, status })
处理用户请求申请
参数：{ targetUid, fromsource, status }
说明：IM 对接文档.docx 关键字：“HANDLE_FRIEND”
返回 promise 对象 数据结构后端提供

user.setClientToTopList(targetUid, status)
好友置顶
参数：

- @param {String} targeId 用户 uid
- @param {Number} status 0:取消， 1:置顶
  说明：IM 对接文档.docx 关键字：“TOP_FRIEND”
  返回 promise 对象 成功：返回新的好友列表 Array

user.getTargetClientShip(targetUid)
查询对方通信录是否存在自己
参数：
@param {String} targeId 用户 uid
说明：IM 对接文档.docx 关键字：“GFR”
返回 promise 对象

user.createGroup(data)
创建群
参数：data
说明：IM 对接文档.docx 关键字：“CG”
返回 无

user.getGroupByGid(gid)
查找本地群
参数：gid 群 ID
返回: 成功=》group 对象 失败：null

user.getGroupList({ refash = false, dt = 0, groupStatus = 1, notifyContent = null })
获取群列表
参数：
refash：false(获取本地 )|true（获取服务器） ,
dt:时间节点
groupStatus:群分类
notifyContent：IM 对接文档.docx 关键字：“GGL”
返回: promise 对象 成功=》group 对象的集合 失败：null

user.removeGroupByGid(gid, notifyContent = null)
删除群组
参数：gid 群 ID
notifyContent： 备注文字
返回: promise 对象 成功=》true 失败：false
说明：IM 对接文档.docx 关键字：“DG”

user.editGroupByGid(gid, { type, value, key })
删除群组
参数：
gid 群 ID
{ type, value, key }：参考说明文档 "IM 对接文档.docx" 关键字：“MODIFY_GROUP”
返回: promise 对象 成功=》true 失败：false

user.quitGroupByGid(gid)
退出群组
参数：
gid 群 ID
关键字：“QUIT_GROUP”
返回: promise 对象 成功=》true 失败：false

user.getGroupMembersByGid(gid, dt = 0)
获取群组成员
参数：
gid 群 ID
dt 时间节点 默认：0
参考：说明文档 "IM 对接文档.docx"关键字：“GET_GROUP_MEMBER”
返回: promise 对象 成功=》true 失败：false

user.addGroupMembers({ gid, menbers })
增加群组成员
参数：
gid 群 ID
menbers 对象，说明文档 "IM 对接文档.docx"关键字：“ADD_GROUP_MEMBER”
返回: promise 对象 成功==>返回新的群列表 失败：[]

user.silenceGroupMember({ gid, userUids, silence })
禁言群组成员
参数：
{ gid, userUids, silence } 说明文档 "IM 对接文档.docx"关键字：“SGM”
返回: promise 对象 成功==>返回新的群用户列表 失败：[]

user.deleteMenmber(gid, menbers)
删除群组成员
参数：
gid 群 ID
menbers: 对象，说明文档 "IM 对接文档.docx" 关键字：“RGM”
返回: promise 对象 成功==>true 失败：false

user.modifyUser({ scope, key, value })

- 置顶/禁言群聊/单聊
  - @param {String} uid uid
  - @param {String} scope 禁言/置顶类型
  - @param {String} key 置顶（群聊 gid|122 单聊 uid|123）；禁言：key 为 gid 值
  - @param {String} value 0-否 1-是
    参考：说明文档 "IM 对接文档.docx"关键字：“UUS”
    返回: promise 对象 成功==>true 失败：false
