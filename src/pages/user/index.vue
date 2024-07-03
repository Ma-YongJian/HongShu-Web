<template>
  <div class="user-page">
    <div class="user">
      <div class="user-info">
        <div class="avatar">
          <div class="avatar-wrapper">
            <img :src="userInfo.avatar" class="user-image" style="border: 0.0625rem solid rgba(0, 0, 0, 0.08)" />
            <div class="img-edit">
              <el-upload
                v-show="uid === currentUid"
                class="upload-demo"
                :action="fileAction"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :headers="uploadHeader"
              >
                <button class="btn-avatr">更换</button>
              </el-upload>
            </div>
          </div>
        </div>
        <div class="info-part">
          <div class="info">
            <div class="basic-info">
              <div class="user-basic">
                <div class="user-nickname">
                  <div class="user-name" v-if="uid === currentUid">
                    <span v-if="!_isEditInfo"> {{ userInfo.username }}</span>
                    <el-input
                      v-else
                      v-model="userInfo.username"
                      style="width: 15rem"
                      maxlength="10"
                      placeholder="Please input"
                      show-word-limit
                      @keyup.enter="confirmUserInfo"
                      type="text"
                    />
                    <el-button
                      :icon="Edit"
                      v-show="!_isEditInfo"
                      @click="_isEditInfo = true"
                      circle
                      size="small"
                      style="margin-left: 0.3125rem"
                    />
                  </div>
                  <div class="user-name" v-else>
                    {{ userInfo.username }}
                  </div>
                </div>
                <div class="user-content">
                  <span class="user-redId">小红书号：{{ userInfo.hsId }}</span
                  ><span class="user-IP"> IP属地：{{ userInfo.address }}</span>
                </div>
              </div>
            </div>
            <div class="user-desc">
              <div v-if="!_isEditInfo">
                <span v-if="userInfo.description === null">这个人什么都没有写～</span>
                <span v-else>{{ userInfo.description }}</span>
              </div>
              <el-input
                v-else
                v-model="userInfo.description"
                maxlength="250"
                placeholder="Please input"
                @keyup.enter="confirmUserInfo"
                show-word-limit
                :autosize="true"
                type="textarea"
              />
            </div>
            <div class="user-tags">
              <el-tag
                style="margin-left: 0.3125rem"
                v-for="tag in tagList"
                :key="tag"
                :closable="uid === currentUid"
                :disable-transitions="false"
                @close="handleClose(tag)"
                effect="light"
                type="info"
                round
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputTagValue"
                style="width: 3.125rem; margin-left: 0.3125rem"
                size="small"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
              />
              <el-button
                style="margin-left: 0.3125rem"
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput"
                round
                v-show="uid === currentUid"
              >
                +
              </el-button>
            </div>
            <div class="data-info">
              <div class="user-interactions">
                <div>
                  <span class="count">{{ userInfo.trendCount }}</span
                  ><span class="shows">作品</span>
                </div>
                <div>
                  <span class="count">{{ userInfo.followerCount }}</span
                  ><span class="shows">关注</span>
                </div>
                <div>
                  <span class="count">{{ userInfo.fanCount }}</span
                  ><span class="shows">粉丝</span>
                </div>
              </div>
            </div>
          </div>
          <div class="follow"></div>
        </div>
        <div class="tool-btn" v-show="uid !== currentUid">
          <el-button :icon="ChatLineRound" circle @click="chatShow = true" />
          <el-button type="info" round v-if="_isFollow" @click="follow(uid, 1)">已关注</el-button>
          <el-button type="danger" round v-else @click="follow(uid, 0)">关注</el-button>
        </div>
      </div>
    </div>
    <div class="reds-sticky-box user-page-sticky" style="--1ee3a37c: all 0.4s cubic-bezier(0.2, 0, 0.25, 1) 0s">
      <div class="reds-sticky" style="">
        <div class="tertiary center reds-tabs-list" style="padding: 0rem 0.75rem">
          <div
            :class="type == 1 ? 'reds-tab-item active' : 'reds-tab-item'"
            style="padding: 0rem 1rem; margin-right: 0rem; font-size: 1rem"
          >
            <span @click="toPage(1)">笔记</span>
          </div>
          <div
            :class="type == 2 ? 'reds-tab-item active' : 'reds-tab-item'"
            style="padding: 0rem 1rem; margin-right: 0rem; font-size: 1rem"
          >
            <span @click="toPage(2)">点赞</span>
          </div>
          <div
            :class="type == 3 ? 'reds-tab-item active' : 'reds-tab-item'"
            style="padding: 0rem 1rem; margin-right: 0rem; font-size: 1rem"
          >
            <span @click="toPage(3)">收藏</span>
          </div>
          <div class="active-tag" style="width: 4rem; left: 39.1875rem"></div>
        </div>
      </div>
    </div>
    <div class="feeds-tab-container" style="--1ee3a37c: all 0.4s cubic-bezier(0.2, 0, 0.25, 1) 0s">
      <Chat
        v-if="chatShow"
        :acceptUid="uid"
        class="animate__animated animate__zoomIn animate__delay-0.5s"
        @click-chat="chatShow = false"
      >
      </Chat>
      <Note :type="type"> </Note>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChatLineRound, Edit } from "@element-plus/icons-vue";
import { ref, nextTick } from "vue";
import { getUserById, updateUser } from "@/api/user";
import Note from "@/components/Note.vue";
import { useUserStore } from "@/store/userStore";
import Chat from "@/components/Chat.vue";
import { followById, isFollow } from "@/api/follower";
import { useRoute } from "vue-router";
import { ElInput, ElMessage, UploadProps } from "element-plus";
import { baseURL } from "@/constant/constant";

const route = useRoute();
const userStore = useUserStore();
const uploadHeader = ref({
  accessToken: userStore.getToken(),
});
const currentUid = userStore.getUserInfo().id;
const userInfo = ref<any>({});
//const uid = history.state.uid;
const uid = route.query.uid as string;
const type = ref(1);
const chatShow = ref(false);
const _isFollow = ref(false);
const _isEditInfo = ref(false);
const tagList = ref<string[]>([]);
const inputVisible = ref(false);
const InputRef = ref<InstanceType<typeof ElInput>>();
const inputTagValue = ref("");
const fileAction = baseURL + "web/oss/save/1";

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
};

const handleClose = (tag: string) => {
  tagList.value.splice(tagList.value.indexOf(tag), 1);
  commonUpdateUser();
};

const handleInputConfirm = () => {
  if (inputTagValue.value) {
    tagList.value.push(inputTagValue.value);
    commonUpdateUser();
  }
  // _isClosable.value = false;
  inputVisible.value = false;
  inputTagValue.value = "";
};

const commonUpdateUser = () => {
  // 检查标签数量并处理
  if (tagList.value.length > 4) {
    tagList.value.splice(4);
    ElMessage.warning("最多支持4个标签!");
    return;
  }
  // 创建用户DTO对象并赋值
  let userDTO = {
    id: userInfo.value.id,
    avatar: userInfo.value.avatar,
    username: userInfo.value.username,
    description: userInfo.value.description,
    tags: JSON.stringify(tagList.value),
  };
  updateUser(userDTO)
    .then(() => {
      // 更新用户存储信息
      ElMessage.success("修改成功～");
      const user = userStore.getUserInfo();
      user.avatar = userInfo.value.avatar;
      userStore.setUserInfo(user);
    })
    .catch(() => {
      ElMessage.error("更新失败，请稍后再试!");
    });
};

const confirmUserInfo = () => {
  _isEditInfo.value = false;
  commonUpdateUser();
};

const toPage = (val: number) => {
  type.value = val;
};

const handleAvatarSuccess: UploadProps["onSuccess"] = (response) => {
  userInfo.value.avatar = response.data;
  commonUpdateUser();
};

const follow = (fid: string, type: number) => {
  followById(fid).then(() => {
    _isFollow.value = type == 0;
  });
};

const initData = () => {
  getUserById(uid).then((res) => {
    userInfo.value = res.data;
    if (res.data.tags != null) {
      tagList.value = JSON.parse(res.data.tags);
    }
  });
  isFollow(uid).then((res) => {
    _isFollow.value = res.data;
  });
};

initData();
</script>

<style lang="less" scoped>
:deep(.el-button:hover) {
  background-color: #fff;
  color: black;
  border-color: #f4f4f4;
}

:deep(.el-tag) {
  border: 0;
}

.user-page {
  background: #fff;
  height: 100vh;

  .user {
    padding-top: 4.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .user-info {
      display: flex;
      justify-content: center;
      padding: 3rem 0;

      .avatar {
        .avatar-wrapper {
          text-align: center;
          width: 15.6667rem;
          height: 10.9667rem;

          .user-image {
            border-radius: 50%;
            margin: 0 auto;
            width: 70%;
            height: 100%;
            object-fit: cover;
          }

          .btn-avatr {
            border: 0.0625rem solid #f4f4f4;
            width: 2.875rem;
            font-size: 0.75rem;
            height: 1.75rem;
            color: #1f1e1e;
            border-radius: 0.5rem;
          }
          .btn-avatr:hover {
            background-color: #f4f4f4;
            color: #000;
          }
        }
      }

      .info-part {
        position: relative;
        width: 100%;

        .info {
          @media screen and (min-width: 108rem) {
            width: 33.3333rem;
          }

          margin-left: 2rem;

          .basic-info {
            display: flex;
            align-items: center;

            .user-basic {
              width: 100%;

              .user-nickname {
                width: 100%;
                display: flex;
                align-items: center;
                max-width: calc(100% - 6rem);

                .user-name {
                  font-weight: 600;
                  font-size: 1.5rem;
                  line-height: 120%;
                  color: #333;
                }
              }

              .user-content {
                width: 100%;
                font-size: 0.75rem;
                line-height: 120%;
                color: rgba(51, 51, 51, 0.6);
                display: flex;
                margin-top: 0.5rem;

                .user-redId {
                  padding-right: 0.75rem;
                }
              }
            }
          }

          .user-desc {
            width: 100%;
            font-size: 0.875rem;
            line-height: 140%;
            color: #333;
            margin-top: 1rem;
            white-space: pre-line;
          }

          .user-tags {
            height: 1.5rem;
            margin-top: 1rem;
            display: flex;
            align-items: center;
            font-size: 0.75rem;
            color: #333;
            text-align: center;
            font-weight: 400;
            line-height: 120%;

            .tag-item :first-child {
              padding: 0.1875rem 0.375rem;
            }

            .tag-item {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0.25rem 0.5rem;
              grid-gap: 0.25rem;
              gap: 0.25rem;
              height: 1.125rem;
              border-radius: 2.5625rem;
              background: rgba(0, 0, 0, 0.03);
              height: 1.5rem;
              line-height: 1.5rem;
              margin-right: 0.375rem;
              color: rgba(51, 51, 51, 0.6);
            }
            :hover {
              cursor: pointer; /* 显示小手指针 */
              transform: scale(1.15); /* 鼠标移入时按钮稍微放大 */
            }
          }

          .data-info {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 1.25rem;

            .user-interactions {
              width: 100%;
              display: flex;
              align-items: center;

              .count {
                font-weight: 500;
                font-size: 0.875rem;
                margin-right: 0.25rem;
              }

              .shows {
                color: rgba(51, 51, 51, 0.6);
                font-size: 0.875rem;
                line-height: 120%;
              }
            }

            .user-interactions > div {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              margin-right: 1rem;
            }
          }
        }

        .follow {
          position: absolute;
          margin-left: auto;
          display: block;
          right: 0;
          top: 0;
        }
      }

      .tool-btn {
        position: absolute;
        top: 50%;
        right: 10%;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .tool-btn {
        @media screen and (min-width: 108rem) {
          display: none;
        }
      }

      .tool-btn {
        @media screen and (min-width: 90.3958rem) {
          display: none;
        }
      }

      .tool-btn {
        @media screen and (min-width: 109.375rem) {
          display: inline-block;
        }
      }
    }
  }

  .reds-sticky {
    padding: 1rem 0;
    z-index: 5 !important;
    background: hsla(0, 0%, 100%, 0.98);

    .reds-tabs-list {
      @media screen and (min-width: 108rem) {
        width: 90.3333rem;
      }

      display: flex;
      flex-wrap: nowrap;
      position: relative;
      font-size: 1rem;
      justify-content: center;

      .reds-tab-item {
        padding: 0rem 1rem;
        margin-right: 0rem;
        font-size: 1rem;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 2.5rem;
        cursor: pointer;
        color: rgba(51, 51, 51, 0.8);
        white-space: nowrap;
        transition: transform 0.3s cubic-bezier(0.2, 0, 0.25, 1);
        z-index: 1;
      }
      :hover {
        cursor: pointer; /* 显示小手指针 */
        transform: scale(1.15); /* 鼠标移入时按钮稍微放大 */
      }

      .reds-tab-item.active {
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 1.25rem;
        font-weight: 600;
        color: rgba(51, 51, 51, 0.8);
      }
    }
  }

  .feeds-tab-container {
    padding-left: 2rem;
  }
}
</style>
