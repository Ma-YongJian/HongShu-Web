<template>
  <div
    class="container"
    style="transition: background-color 0.4s ease 0s;
  hsla(0,0%,100%,0.98)"
  >
    <div class="chat-container">
      <header class="chat-header">
        <div class="header-left"></div>
        <div class="header-user">
          <el-avatar :src="acceptUser.avatar" />
          <span style="margin-left: 0.3125rem">{{ acceptUser.username }}</span>
        </div>
        <div class="header-tool">
          <More class="icon-item"></More>
        </div>
      </header>
      <hr color="#f4f4f4" />
      <main class="chat-main">
        <div class="chat-record" ref="ChatRef" @scroll="showScroll()">
          <div v-for="(item, index) in dataList" :key="index">
            <div class="message-my-item" v-if="item.acceptUid === acceptUser.id">
              <Loading v-show="item.isLoading" style="width: 0.8em; height: 0.8em; margin-right: 0.5rem" />
              <div class="message-my-conent" v-if="item.msgType == 1">{{ item.content }}</div>
              <img :src="item.content" class="message-img" v-if="item.msgType == 2" />
              <div class="user-avatar">
                <el-avatar :src="currentUser.avatar" />
              </div>
            </div>

            <div class="message-item" v-else>
              <div class="user-avatar">
                <el-avatar :src="acceptUser.avatar" />
              </div>
              <div class="message-conent" v-if="item.msgType == 1">{{ item.content }}</div>
              <img :src="item.content" class="message-img" v-if="item.msgType == 2" />
            </div>
          </div>
        </div>
        <hr color="#f4f4f4" />
        <div class="chat-input">
          <div class="input-tool">
            <div class="tool-left">
              <PieChart class="icon-item"></PieChart>
              <el-upload :auto-upload="false" :show-file-list="false" :on-change="handleChange">
                <Picture class="icon-item"></Picture>
              </el-upload>
            </div>
            <div class="tool-history">
              <Clock class="icon-item"></Clock>
            </div>
          </div>

          <!-- <textarea type="textarea" v-model="content" class="input-content" rows="15" @keyup.enter="submit" /> -->
          <div class="input-content">
            <p
              id="post-textarea"
              ref="postContent"
              class="post-content"
              contenteditable="true"
              data-tribute="true"
              placeholder="请输入消息，支持发送图片哦～"
              @keyup.enter="submit"
            ></p>
            <div class="input-btn">
              <div></div>
              <el-button type="primary" round style="width: 5.55rem" @click="submit">发送</el-button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div class="close-cricle" @click="close">
      <div class="close close-mask-white">
        <Close style="width: 1.2em; height: 1.2em; color: rgba(51, 51, 51, 0.8)" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { More, PieChart, Picture, Clock, Close, Loading } from "@element-plus/icons-vue";
import { ref, onMounted, watch, nextTick } from "vue";
import { getUserById } from "@/api/user";
import { getAllChatRecord, sendMsg } from "@/api/im";
import { useUserStore } from "@/store/userStore";
import { useImStore } from "@/store/imStore";
import type { UploadProps } from "element-plus";
import { convertImgToBase64 } from "@/utils/util";
import { getRandomString } from "@/utils/util";

const imStore = useImStore();
const userStore = useUserStore();
const props = defineProps({
  acceptUid: {
    type: String,
    default: "",
  },
});

const ChatRef = ref();
const currentUser = ref<any>({});
const acceptUser = ref<any>({});
const dataList = ref<any>();
const currentPage = ref(1);
const pageSize = 15;
const messageTotal = ref(0);
const postContent = ref(null);

watch(
  () => imStore.message,
  (newVal) => {
    if (newVal.sendUid === acceptUser.value.id) {
      insertMessage(newVal);
    }
  },
  {
    deep: true,
  }
);

const insertMessage = async (message: any) => {
  dataList.value?.push(message);
  await nextTick();
  // 滚动到最底部
  ChatRef.value.lastElementChild.scrollIntoView({
    block: "start",
    behavior: "smooth",
  });
};

const emit = defineEmits(["clickChat"]);

const close = () => {
  emit("clickChat", props.acceptUid);
};

// 选择图片
const handleChange: UploadProps["onChange"] = (uploadFile) => {
  const imgSrc = URL.createObjectURL(uploadFile.raw!);
  convertImgToBase64(
    uploadFile.raw!,
    (data: any) => {
      document.getElementById("post-textarea")!.innerHTML +=
        `<img src='${imgSrc}' text='${data}' style='width:3.75rem;height:3.75rem;object-fit: cover;'></img>`;
    },
    (error: any) => {
      console.log("error", error);
    }
  );
};

const sendMessage = (message: any) => {
  new Promise((res) => {
    insertMessage(message);
    res(message);
  }).then((_message: any) => {
    sendMsg(_message).then(() => {
      const data = dataList.value.filter((item: any) => item.id === _message.id);
      data[0].isLoading = false;
    });
  });
};

const submit = () => {
  let htmlContent = document.getElementById("post-textarea")!.innerHTML;

  if (htmlContent === "") {
    return;
  }

  const imgReg = /<img.*?(?:>|\/>)/gi;
  const srcReg = /text=[\'\"]?([^\'\"]*)[\'\"]?/i;
  // let params = new FormData();
  // //注意此处对文件数组进行了参数循环添加
  const _contentImg = htmlContent.match(imgReg);

  const replaceContent = htmlContent.replaceAll(imgReg, "#").replace(/<[^>]*>[^<]*(<[^>]*>)?/gi, "");
  // 内容分割
  const _splitContent = replaceContent.split("#");

  _splitContent.forEach((item: string) => {
    if (item === null || item === "") {
      return;
    }
    //发送文字消息
    const message = {} as any;
    message.id = getRandomString(12);
    message.sendUid = currentUser.value.id;
    message.acceptUid = acceptUser.value.id;
    message.content = item;
    message.msgType = 1;
    message.chatType = 0;
    message.isLoading = true;
    sendMessage(message);
  });

  // 图片分割
  _contentImg?.forEach((item: any) => {
    const src = item.match(srcReg);
    const message = {} as any;
    message.id = getRandomString(12);
    message.sendUid = currentUser.value.id;
    message.acceptUid = acceptUser.value.id;
    message.content = src[1];
    message.msgType = 2;
    message.chatType = 0;
    message.isLoading = true;
    sendMessage(message);
  });
  // const content = htmlContent.replace(/<[^>]*>[^<]*(<[^>]*>)?/gi, "");
  document.getElementById("post-textarea")!.innerHTML = "";
};

const showScroll = () => {
  const topval = ChatRef.value.scrollTop;
  if (topval === 0) {
    loadMoreData();
  }
};

const loadMoreData = () => {
  currentPage.value++;
  getAllChatRecordMethod();
};

const getAllChatRecordMethod = () => {
  getAllChatRecord(currentPage.value, pageSize, props.acceptUid).then((res) => {
    const { records, total } = res.data;
    messageTotal.value = total;
    records.forEach((item: any) => {
      dataList.value?.splice(0, 0, item);
    });
    if (dataList.value.length >= total) {
      ChatRef.value.scrollTop = 0;
    } else {
      ChatRef.value.scrollTop += ChatRef.value.clientHeight;
    }
  });
};

onMounted(async () => {
  currentUser.value = userStore.getUserInfo();
  getUserById(props.acceptUid).then((res) => {
    acceptUser.value = res.data;
  });
  dataList.value = [];
  getAllChatRecord(currentPage.value, pageSize, props.acceptUid).then(async (res) => {
    const { records, total } = res.data;
    messageTotal.value = total;
    records.forEach((item: any) => {
      dataList.value.splice(0, 0, item);
    });
    await nextTick();
    // 滚动到最底部
    ChatRef.value.lastElementChild.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  });
});
</script>
<style lang="less" scoped>
.icon-item {
  width: 1.2em;
  height: 1.2em;
  margin-right: 0.3125rem;
  color: rgba(51, 51, 51, 0.8);
}

.container {
  position: fixed;
  left: 45%;
  top: 50%;
  width: 90vw;
  height: 85vh;
  z-index: 20;
  overflow: auto;
  transform: translate(-50%, -50%);
  border-radius: 10px; /* 可选：为容器添加圆角 */

  .chat-container {
    width: 65%;
    margin: 0 auto;
    height: 90%;
    min-width: 50rem;
    transition:
      transform 0.4s ease 0s,
      width 0.4s ease 0s;
    transform: translate(6.5rem, 2rem) scale(1);
    overflow: visible;
    box-shadow:
      0 0.5rem 4rem 0 rgba(0, 0, 0, 0.04),
      0 0.0625rem 0.25rem 0 rgba(0, 0, 0, 0.02);
    border-radius: 1.25rem;
    background-color: #fff;
    transform-origin: left top;
    z-index: 100;

    .chat-header {
      height: 3.75rem;
      width: 100%;
      background-color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-user {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .chat-main {
      height: 100%;

      .message-img {
        width: 15rem;
        height: 18.75rem;
        object-fit: cover;
        margin: 0 0.3125rem;
        border-radius: 0.5rem;
      }

      .chat-record {
        height: 60%;
        padding: 0 1.25rem;
        overflow-y: scroll;

        .message-item {
          display: flex;
          justify-content: left;
          align-items: center;
          margin: 1.25rem 0;

          .message-conent {
            margin-left: 0.3125rem;
            padding: 0.25rem 0.625rem;
            border: 0.0625rem solid #f4f4f4;
            background-color: #fff;
            border-radius: 0.5rem;
            font-size: 1rem;
          }
        }

        .message-my-item {
          display: flex;
          justify-content: right;
          align-items: center;
          margin: 1.25rem 0;

          .message-my-conent {
            margin-right: 0.3125rem;
            padding: 0.25rem 0.625rem;
            color: #fff;
            background-color: rgb(0, 170, 255);
            border-radius: 0.5rem;
            font-size: 1rem;
          }
        }
      }

      .chat-input {
        height: 25%;

        .input-tool {
          display: flex;
          justify-content: space-between;
          height: 1.25rem;
          padding: 0 0.3125rem;

          .tool-left {
            display: flex;
            justify-content: left;
          }
        }

        .input-content {
          width: 100%;
          height: 90%;
          resize: none;
          border: 0rem;
          outline: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .input-btn {
            display: flex;
            justify-content: space-between;
            padding: 0 0.625rem;
          }
        }

        .post-content:empty::before {
          content: attr(placeholder);
          color: #ccc;
          font-size: 0.875rem;
        }

        .post-content {
          cursor: text;
          width: 100%;
          min-height: 60%;
          margin-bottom: 1.25rem;
          background: #fff;
          padding: 0rem 0.75rem 1.375rem;
          outline: none;
          overflow-y: auto;
          text-rendering: optimizeLegibility;
          font-size: 0.875rem;
          line-height: 1.375rem;
        }
      }
    }
  }

  .close-cricle {
    left: 18vw;
    top: 1.3vw;
    position: fixed;
    display: flex;
    z-index: 100;
    cursor: pointer;

    .close-mask-white {
      box-shadow:
        0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.04),
        0 0.0625rem 0.125rem 0 rgba(0, 0, 0, 0.02);
      border: 0.0625rem solid rgba(0, 0, 0, 0.08);
    }

    .close {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 2.5rem;
      cursor: pointer;
      transition: all 0.3s;
      background-color: #fff;
    }
    :hover {
      cursor: pointer; /* 显示小手指针 */
      transform: scale(1.2); /* 鼠标移入时按钮稍微放大 */
    }
  }
}
</style>
