/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/light");

var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.addJSON({
  com: {
    nested: {
      hyjkim: {
        nested: {
          common: {
            nested: {
              protobuf: {
                options: {
                  java_outer_classname: "ImProtocol"
                },
                nested: {
                  PublishMessage: {
                    fields: {
                      packetid: {
                        type: "string",
                        id: 1
                      },
                      payload: {
                        type: "bytes",
                        id: 2
                      }
                    }
                  },
                  PublishAckMessage: {
                    fields: {
                      packetid: {
                        type: "string",
                        id: 1
                      },
                      errorCode: {
                        type: "int32",
                        id: 2
                      },
                      errorMsg: {
                        type: "string",
                        id: 3
                      },
                      payload: {
                        type: "bytes",
                        id: 4
                      }
                    }
                  },
                  AuthenticationRequest: {
                    fields: {
                      token: {
                        type: "string",
                        id: 1
                      },
                      cid: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  UploadDeviceInfoRequest: {
                    fields: {
                      token: {
                        type: "string",
                        id: 1
                      },
                      voipToken: {
                        type: "string",
                        id: 2
                      },
                      platform: {
                        type: "int32",
                        id: 3
                      },
                      pushType: {
                        type: "int32",
                        id: 4
                      },
                      packageName: {
                        type: "string",
                        id: 5
                      },
                      deviceName: {
                        type: "string",
                        id: 6
                      },
                      deviceVersion: {
                        type: "string",
                        id: 7
                      },
                      phoneName: {
                        type: "string",
                        id: 8
                      },
                      language: {
                        type: "string",
                        id: 9
                      },
                      carrierName: {
                        type: "string",
                        id: 10
                      }
                    }
                  },
                  CreateGroupRequest: {
                    fields: {
                      group: {
                        type: "Group",
                        id: 1
                      },
                      notifyContent: {
                        type: "MessageContent",
                        id: 2
                      }
                    }
                  },
                  CreateGroupResult: {
                    fields: {
                      groupInfo: {
                        type: "GroupInfo",
                        id: 1
                      }
                    }
                  },
                  ModifyGroupInfoRequest: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      type: {
                        type: "int32",
                        id: 2
                      },
                      value: {
                        type: "string",
                        id: 3
                      },
                      notifyContent: {
                        type: "MessageContent",
                        id: 4
                      }
                    }
                  },
                  AddGroupMemberRequest: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      addedMember: {
                        rule: "repeated",
                        type: "GroupMember",
                        id: 2
                      },
                      notifyContent: {
                        type: "MessageContent",
                        id: 3
                      }
                    }
                  },
                  RemoveGroupMemberRequest: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      removedMember: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      },
                      notifyContent: {
                        type: "MessageContent",
                        id: 3
                      }
                    }
                  },
                  DismissGroupRequest: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      notifyContent: {
                        type: "MessageContent",
                        id: 2
                      }
                    }
                  },
                  QuitGroupRequest: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      notifyContent: {
                        type: "MessageContent",
                        id: 2
                      }
                    }
                  },
                  TransferGroupRequest: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      newOwner: {
                        type: "string",
                        id: 2
                      },
                      notifyContent: {
                        type: "MessageContent",
                        id: 3
                      }
                    }
                  },
                  ModifyGroupMemberAlias: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      alias: {
                        type: "string",
                        id: 2
                      },
                      notifyContent: {
                        type: "MessageContent",
                        id: 3
                      }
                    }
                  },
                  SetGroupMemberSilenceRequest: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      silence: {
                        type: "int32",
                        id: 2
                      },
                      userId: {
                        rule: "repeated",
                        type: "string",
                        id: 3
                      }
                    }
                  },
                  PullGroupInfoRequest: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      dt: {
                        type: "int64",
                        id: 2
                      }
                    }
                  },
                  PullGroupInfoListRequest: {
                    fields: {
                      pullGroupInfo: {
                        rule: "repeated",
                        type: "PullGroupInfoRequest",
                        id: 1
                      }
                    }
                  },
                  PullGroupInfoResult: {
                    fields: {
                      info: {
                        rule: "repeated",
                        type: "GroupInfo",
                        id: 1
                      }
                    }
                  },
                  PullGroupMemberRequest: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      memberUpdateDt: {
                        type: "int64",
                        id: 2
                      }
                    }
                  },
                  PullGroupMemberResult: {
                    fields: {
                      member: {
                        rule: "repeated",
                        type: "GroupMember",
                        id: 1
                      },
                      gid: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  PullGroupListRequest: {
                    fields: {
                      dt: {
                        type: "int64",
                        id: 1
                      },
                      notifyContent: {
                        type: "MessageContent",
                        id: 2
                      },
                      groupStatus: {
                        type: "int32",
                        id: 3
                      }
                    }
                  },
                  PullGroupListResult: {
                    fields: {
                      info: {
                        rule: "repeated",
                        type: "GroupInfoWithMid",
                        id: 1
                      }
                    }
                  },
                  GroupInfoWithMid: {
                    fields: {
                      groupInfo: {
                        type: "GroupInfo",
                        id: 1
                      },
                      topNineMemberUid: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  AddFriendRequest: {
                    fields: {
                      targetUid: {
                        type: "string",
                        id: 1
                      },
                      reason: {
                        type: "string",
                        id: 2
                      },
                      fromsource: {
                        type: "int32",
                        id: 3
                      },
                      detailedDescription: {
                        type: "string",
                        id: 4
                      },
                      alias: {
                        type: "string",
                        id: 5
                      },
                      fromTag: {
                        type: "int32",
                        id: 6
                      },
                      targetTag: {
                        type: "int32",
                        id: 7
                      }
                    }
                  },
                  MutualAddFriendRequest: {
                    fields: {
                      targetUid: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  GetFriendRequestResult: {
                    fields: {
                      entry: {
                        rule: "repeated",
                        type: "FriendRequest",
                        id: 1
                      },
                      updateDt: {
                        type: "int64",
                        id: 2
                      }
                    }
                  },
                  HandleFriendRequest: {
                    fields: {
                      targetUid: {
                        type: "string",
                        id: 1
                      },
                      status: {
                        type: "int32",
                        id: 2
                      },
                      fromsource: {
                        type: "int32",
                        id: 3
                      },
                      alias: {
                        type: "string",
                        id: 4
                      }
                    }
                  },
                  BlackUserRequest: {
                    fields: {
                      targetUid: {
                        type: "string",
                        id: 1
                      },
                      status: {
                        type: "int32",
                        id: 2
                      }
                    }
                  },
                  GetFriendsResult: {
                    fields: {
                      entry: {
                        rule: "repeated",
                        type: "Friend",
                        id: 1
                      },
                      updateDt: {
                        type: "int64",
                        id: 2
                      },
                      uid: {
                        type: "string",
                        id: 3
                      }
                    }
                  },
                  AliasUserRequest: {
                    fields: {
                      targetUid: {
                        type: "string",
                        id: 1
                      },
                      alias: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  GetFriendStatusResult: {
                    fields: {
                      friendStatus: {
                        rule: "repeated",
                        type: "FriendStatus",
                        id: 1
                      }
                    }
                  },
                  FriendStatus: {
                    fields: {
                      uid: {
                        type: "string",
                        id: 1
                      },
                      targetUid: {
                        type: "string",
                        id: 2
                      },
                      blacked: {
                        type: "int32",
                        id: 3
                      },
                      state: {
                        type: "int32",
                        id: 4
                      }
                    }
                  },
                  PullUserRequest: {
                    fields: {
                      request: {
                        rule: "repeated",
                        type: "UserRequest",
                        id: 1
                      }
                    }
                  },
                  UserRequest: {
                    fields: {
                      uid: {
                        type: "string",
                        id: 1
                      },
                      updateDt: {
                        type: "int64",
                        id: 2
                      }
                    }
                  },
                  PullUserResult: {
                    fields: {
                      result: {
                        rule: "repeated",
                        type: "UserResult",
                        id: 1
                      }
                    }
                  },
                  UserResult: {
                    fields: {
                      user: {
                        type: "User",
                        id: 1
                      },
                      code: {
                        type: "int32",
                        id: 2
                      }
                    }
                  },
                  ModifyMyInfoRequest: {
                    fields: {
                      entry: {
                        rule: "repeated",
                        type: "InfoEntry",
                        id: 1
                      }
                    }
                  },
                  InfoEntry: {
                    fields: {
                      type: {
                        type: "int32",
                        id: 1
                      },
                      value: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  SearchUserRequest: {
                    fields: {
                      keyword: {
                        type: "string",
                        id: 1
                      },
                      fuzzy: {
                        type: "int32",
                        id: 2
                      }
                    }
                  },
                  SearchUserResult: {
                    fields: {
                      entry: {
                        rule: "repeated",
                        type: "User",
                        id: 1
                      }
                    }
                  },
                  ModifyUserSettingRequest: {
                    fields: {
                      uid: {
                        type: "string",
                        id: 1
                      },
                      scope: {
                        type: "int32",
                        id: 2
                      },
                      key: {
                        type: "string",
                        id: 3
                      },
                      value: {
                        type: "string",
                        id: 4
                      }
                    }
                  },
                  ModifyUserSettingResult: {
                    fields: {
                      uid: {
                        type: "string",
                        id: 1
                      },
                      scope: {
                        type: "int32",
                        id: 2
                      },
                      key: {
                        type: "string",
                        id: 3
                      },
                      value: {
                        type: "string",
                        id: 4
                      },
                      updateDt: {
                        type: "int64",
                        id: 5
                      }
                    }
                  },
                  GetUserSettingRequest: {
                    fields: {
                      uid: {
                        type: "string",
                        id: 1
                      },
                      dt: {
                        type: "int64",
                        id: 2
                      }
                    }
                  },
                  GetUserSettingResult: {
                    fields: {
                      entry: {
                        rule: "repeated",
                        type: "UserSettingEntry",
                        id: 1
                      }
                    }
                  },
                  PullMessageRequest: {
                    fields: {
                      seq: {
                        type: "int64",
                        id: 1
                      },
                      type: {
                        type: "int32",
                        id: 2
                      }
                    }
                  },
                  PullMessageResult: {
                    fields: {
                      message: {
                        rule: "repeated",
                        type: "Message",
                        id: 1
                      },
                      currentSeq: {
                        type: "int64",
                        id: 2
                      }
                    }
                  },
                  SendMessageResult: {
                    fields: {
                      messageId: {
                        type: "int64",
                        id: 1
                      },
                      currentSeq: {
                        type: "int64",
                        id: 2
                      },
                      dt: {
                        type: "int64",
                        id: 3
                      }
                    }
                  },
                  GroupInfo: {
                    fields: {
                      gid: {
                        type: "string",
                        id: 1
                      },
                      name: {
                        type: "string",
                        id: 2
                      },
                      portrait: {
                        type: "string",
                        id: 3
                      },
                      owner: {
                        type: "string",
                        id: 4
                      },
                      memberCount: {
                        type: "int32",
                        id: 5
                      },
                      extra: {
                        type: "string",
                        id: 6
                      },
                      updateDt: {
                        type: "int64",
                        id: 7
                      },
                      memberUpdateDt: {
                        type: "int64",
                        id: 8
                      },
                      mute: {
                        type: "int32",
                        id: 9
                      },
                      privateChat: {
                        type: "int32",
                        id: 10
                      },
                      introduction: {
                        type: "string",
                        id: 11
                      },
                      announcement: {
                        type: "string",
                        id: 12
                      },
                      status: {
                        type: "int32",
                        id: 13
                      },
                      makefriend: {
                        type: "int32",
                        id: 14
                      },
                      createDt: {
                        type: "int64",
                        id: 15
                      }
                    }
                  },
                  Message: {
                    fields: {
                      conversation: {
                        type: "Conversation",
                        id: 1
                      },
                      fromUser: {
                        type: "string",
                        id: 2
                      },
                      cid: {
                        type: "string",
                        id: 3
                      },
                      content: {
                        type: "MessageContent",
                        id: 4
                      },
                      messageId: {
                        type: "int64",
                        id: 5
                      },
                      dt: {
                        type: "int64",
                        id: 6
                      },
                      seq: {
                        type: "int64",
                        id: 7
                      },
                      toUser: {
                        type: "string",
                        id: 8
                      },
                      to: {
                        rule: "repeated",
                        type: "string",
                        id: 9
                      }
                    }
                  },
                  MessageList: {
                    fields: {
                      message: {
                        rule: "repeated",
                        type: "Message",
                        id: 1
                      }
                    }
                  },
                  Conversation: {
                    fields: {
                      type: {
                        type: "int32",
                        id: 1
                      },
                      target: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  MessageContent: {
                    fields: {
                      type: {
                        type: "int32",
                        id: 1
                      },
                      searchableContent: {
                        type: "string",
                        id: 2
                      },
                      pushContent: {
                        type: "string",
                        id: 3
                      },
                      content: {
                        type: "string",
                        id: 4
                      },
                      remoteMediaUrl: {
                        type: "string",
                        id: 5
                      },
                      persistFlag: {
                        type: "int32",
                        id: 6
                      },
                      mentionedType: {
                        type: "int32",
                        id: 7
                      },
                      mentionedTarget: {
                        rule: "repeated",
                        type: "string",
                        id: 8
                      },
                      extra: {
                        type: "string",
                        id: 9
                      }
                    }
                  },
                  GroupMember: {
                    fields: {
                      memberId: {
                        type: "string",
                        id: 1
                      },
                      alias: {
                        type: "string",
                        id: 2
                      },
                      type: {
                        type: "int32",
                        id: 3
                      },
                      silence: {
                        type: "int32",
                        id: 4
                      },
                      updateDt: {
                        type: "int64",
                        id: 5
                      },
                      sort: {
                        type: "int32",
                        id: 6
                      }
                    }
                  },
                  Group: {
                    fields: {
                      groupInfo: {
                        type: "GroupInfo",
                        id: 1
                      },
                      members: {
                        rule: "repeated",
                        type: "GroupMember",
                        id: 2
                      }
                    }
                  },
                  Friend: {
                    fields: {
                      uid: {
                        type: "string",
                        id: 1
                      },
                      state: {
                        type: "int32",
                        id: 2
                      },
                      updateDt: {
                        type: "int64",
                        id: 3
                      },
                      alias: {
                        type: "string",
                        id: 4
                      },
                      fromsource: {
                        type: "int32",
                        id: 5
                      },
                      detailedDescription: {
                        type: "string",
                        id: 6
                      },
                      blacked: {
                        type: "int32",
                        id: 7
                      },
                      isTop: {
                        type: "int32",
                        id: 8
                      },
                      tag: {
                        type: "int32",
                        id: 9
                      }
                    }
                  },
                  User: {
                    fields: {
                      uid: {
                        type: "string",
                        id: 1
                      },
                      userId: {
                        type: "string",
                        id: 2
                      },
                      displayName: {
                        type: "string",
                        id: 3
                      },
                      portrait: {
                        type: "string",
                        id: 4
                      },
                      mobile: {
                        type: "string",
                        id: 5
                      },
                      email: {
                        type: "string",
                        id: 6
                      },
                      address: {
                        type: "string",
                        id: 7
                      },
                      company: {
                        type: "string",
                        id: 8
                      },
                      extra: {
                        type: "string",
                        id: 9
                      },
                      updateDt: {
                        type: "int64",
                        id: 10
                      },
                      gender: {
                        type: "int32",
                        id: 11
                      },
                      social: {
                        type: "string",
                        id: 12
                      },
                      type: {
                        type: "int32",
                        id: 13
                      },
                      status: {
                        type: "int32",
                        id: 14
                      },
                      createTime: {
                        type: "int64",
                        id: 15
                      }
                    }
                  },
                  UserSettingEntry: {
                    fields: {
                      uid: {
                        type: "string",
                        id: 1
                      },
                      scope: {
                        type: "int32",
                        id: 2
                      },
                      key: {
                        type: "string",
                        id: 3
                      },
                      value: {
                        type: "string",
                        id: 4
                      },
                      updateDt: {
                        type: "int64",
                        id: 5
                      }
                    }
                  },
                  FriendRequest: {
                    fields: {
                      fromUid: {
                        type: "string",
                        id: 1
                      },
                      toUid: {
                        type: "string",
                        id: 2
                      },
                      reason: {
                        type: "string",
                        id: 3
                      },
                      status: {
                        type: "int32",
                        id: 4
                      },
                      updateDt: {
                        type: "int64",
                        id: 5
                      },
                      fromReadStatus: {
                        type: "bool",
                        id: 6
                      },
                      toReadStatus: {
                        type: "bool",
                        id: 7
                      },
                      fromsource: {
                        type: "int32",
                        id: 8
                      },
                      createDt: {
                        type: "int64",
                        id: 9
                      },
                      fromTag: {
                        type: "int32",
                        id: 10
                      },
                      targetTag: {
                        type: "int32",
                        id: 11
                      }
                    }
                  },
                  NotifyMessage: {
                    fields: {
                      type: {
                        type: "int32",
                        id: 1
                      },
                      seq: {
                        type: "int64",
                        id: 2
                      }
                    }
                  },
                  AuthenticationResult: {
                    fields: {
                      fileDomain: {
                        type: "string",
                        id: 1
                      },
                      heartbeatInterval: {
                        type: "int64",
                        id: 2
                      }
                    }
                  },
                  BindingGatewayIdRequest: {
                    fields: {
                      gatewayId: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  SearchMessageRequest: {
                    fields: {
                      messageDt: {
                        type: "int64",
                        id: 1
                      },
                      pageSize: {
                        type: "int32",
                        id: 2
                      },
                      type: {
                        type: "int32",
                        id: 3
                      },
                      fromUid: {
                        type: "string",
                        id: 4
                      },
                      toUid: {
                        type: "string",
                        id: 5
                      },
                      groupId: {
                        type: "string",
                        id: 6
                      }
                    }
                  },
                  MediaMessage: {
                    fields: {
                      fromUid: {
                        type: "string",
                        id: 1
                      },
                      targetUid: {
                        type: "string",
                        id: 2
                      },
                      extra: {
                        type: "string",
                        id: 3
                      }
                    }
                  },
                  HandleTopFriend: {
                    fields: {
                      targetUid: {
                        type: "string",
                        id: 1
                      },
                      status: {
                        type: "int32",
                        id: 2
                      }
                    }
                  },
                  DeleteMessageRequest: {
                    fields: {
                      targetId: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  DeleteFriendRequest: {
                    fields: {
                      targetUid: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  GetFriendRelationShipResult: {
                    fields: {
                      exist: {
                        type: "bool",
                        id: 1
                      }
                    }
                  },
                  Version: {
                    fields: {
                      updateDt: {
                        type: "int64",
                        id: 1
                      }
                    }
                  },
                  UserPK: {
                    fields: {
                      targetUid: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  GetMessageRequest: {
                    fields: {
                      type: {
                        type: "int32",
                        id: 1
                      },
                      targetId: {
                        type: "string",
                        id: 2
                      },
                      seq: {
                        type: "int64",
                        id: 3
                      }
                    }
                  },
                  GetFriendsRequest: {
                    fields: {
                      updateDt: {
                        type: "int64",
                        id: 1
                      },
                      targetUid: {
                        type: "string",
                        id: 2
                      },
                      tag: {
                        type: "int32",
                        id: 3
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});

module.exports = $root;
