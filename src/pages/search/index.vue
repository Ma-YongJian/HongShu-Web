<template>
  <div class="feeds-page">
    <div class="middle">
      <div id="search-type">
        <div data-v-7f9e6aac="" class="scroll-container channel-scroll-container">
          <div class="content-container">
            <div :class="typeClass == 0 ? 'channel active' : 'channel'" @click="getNoteByType(0)">全部</div>
            <div :class="typeClass == 1 ? 'channel active' : 'channel'" @click="getNoteByType(1)">最热</div>
            <div :class="typeClass == 2 ? 'channel active' : 'channel'" @click="getNoteByType(2)">最新</div>
            <div style="line-height: 40px">|</div>
            <div :class="typeClass == 3 ? 'channel active' : 'channel'" @click="getUserData">用户</div>
          </div>
        </div>
      </div>
      <div class="filter-box">
        <div>
          <div class="filter">
            <!-- <span>综合</span> -->
          </div>
        </div>
      </div>
    </div>
    <div class="divider rec-filter"></div>
    <div class="note-container" v-if="!isShowUser">
      <div class="channel-container">
        <div class="scroll-container channel-scroll-container">
          <div class="content-container">
            <div :class="categoryClass == '0' ? 'channel active' : 'channel'" @click="getNoteList">推荐</div>
            <div
              :class="categoryClass == item.id ? 'channel active' : 'channel'"
              v-for="item in categoryList"
              :key="item.id"
              @click="getNoteListByCategory(item.id)"
            >
              {{ item.title }}
            </div>
          </div>
        </div>
      </div>
      <div class="loading-container"></div>
      <div
        class="feeds-container"
        v-infinite-scroll="loadMoreData"
        :infinite-scroll-distance="50"
        :infinite-scroll-disabled="mainShow || loadingMore"
      >
        <div class="feeds-loading-top animate__animated animate__zoomIn animate__delay-0.5s" v-show="topLoading">
          <Loading style="width: 1.2em; height: 1.2em"></Loading>
        </div>
        <Waterfall
          :list="noteList"
          :width="options.width"
          :gutter="options.gutter"
          :hasAroundGutter="options.hasAroundGutter"
          :animation-effect="options.animationEffect"
          :animation-duration="options.animationDuration"
          :animation-delay="options.animationDelay"
          :breakpoints="options.breakpoints"
          style="min-width: 46.25rem"
        >
          <template #item="{ item }">
            <el-skeleton style="width: 15rem" :loading="!item.isLoading" animated>
              <template #template>
                <el-image
                  :src="item.noteCover"
                  :style="{
                    width: '15rem',
                    maxHeight: '18.75rem',
                    height: item.noteCoverHeight + 'px',
                    borderRadius: '.5rem',
                  }"
                  @load="handleLoad(item)"
                ></el-image>
                <div style="padding: 0.875rem">
                  <el-skeleton-item variant="h3" style="width: 100%" />
                  <div style="display: flex; align-items: center; margin-top: 0.125rem; height: 1rem">
                    <el-skeleton style="--el-skeleton-circle-size: 1.25rem">
                      <template #template>
                        <el-skeleton-item variant="circle" />
                      </template>
                    </el-skeleton>
                    <el-skeleton-item variant="text" style="margin-left: 0.625rem" />
                  </div>
                </div>
              </template>

              <template #default>
                <div class="card" style="max-width: 15rem">
                  <el-image
                    :src="item.noteCover"
                    :style="{
                      width: '15rem',
                      maxHeight: '18.75rem',
                      height: item.noteCoverHeight + 'px',
                      borderRadius: '.5rem',
                    }"
                    fit="cover"
                    @click="toMain(item.id)"
                  ></el-image>
                  <div class="footer">
                    <a class="title">
                      <span>{{ item.title }}</span>
                    </a>
                    <div class="author-wrapper">
                      <a class="author">
                        <img class="author-avatar" :src="item.avatar" />
                        <span class="name">{{ item.username }}</span>
                      </a>
                      <span class="like-wrapper like-active">
                        <i class="iconfont icon-follow" style="width: 1em; height: 1em"></i>
                        <span class="count">{{ item.likeCount }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </el-skeleton>
          </template>
        </Waterfall>

        <div class="feeds-loading">
          <Loading style="width: 1.2em; height: 1.2em" v-show="botLoading"></Loading>
        </div>
      </div>
    </div>

    <div class="user-container" v-else>
      <ul class="agree-container" v-infinite-scroll="loadMoreUser" :infinite-scroll-distance="20">
        <li class="agree-item" v-for="(item, index) in userDataList" :key="index">
          <a class="user-avatar">
            <img class="avatar-item" :src="item.avatar" @click="toUser(item.id)" />
          </a>
          <div class="main">
            <div class="info">
              <div class="user-info">
                <a class>{{ item.username }}</a>
              </div>
              <div class="interaction-hint">
                <span>粉丝:</span><span>{{ item.fanCount }}</span
                >&nbsp;|&nbsp;<span>关注:&nbsp;</span><span>{{ item.followerCount }}</span
                >&nbsp;|&nbsp;<span>作品:&nbsp;</span><span>{{ item.trendCount }}</span>
              </div>
            </div>
            <div class="extra">
              <el-button type="info" round size="large" v-if="item.isFollow" @click="follow(item.uid, index, 1)"
                >已关注</el-button
              >
              <el-button type="danger" round size="large" v-else @click="follow(item.uid, index, -1)">回关</el-button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <FloatingBtn @click-refresh="refresh"></FloatingBtn>
    <Main
      v-show="mainShow"
      :nid="nid"
      :nowTime="new Date()"
      class="animate__animated animate__zoomIn animate__delay-0.5s"
      @click-main="close"
    >
    </Main>
  </div>
</template>

<script lang="ts" setup>
import { Waterfall } from "vue-waterfall-plugin-next";
import "vue-waterfall-plugin-next/dist/style.css";
import { ref, watch } from "vue";
import { getNoteByDTO, getCategoryAgg } from "@/api/search";
import type { NoteDTO, NoteSearch } from "@/type/note";
import type { Category } from "@/type/category";
import Main from "@/pages/main/main.vue";
import FloatingBtn from "@/components/FloatingBtn.vue";
import { options } from "@/constant/constant";
import Loading from "@/components/Loading.vue";
import { refreshTab } from "@/utils/util";
import { useRoute, useRouter } from "vue-router";
import { getUserByKeyword } from "@/api/user";
import { followById } from "@/api/follower";

const route = useRoute();
const router = useRouter();
const topLoading = ref(false);
const botLoading = ref(false);
const noteList = ref<Array<NoteSearch>>([]);
const categoryList = ref<Array<Category>>([]);
const currentPage = ref(1);
const pageSize = 20;
const noteTotal = ref(0);
const currentUserPage = ref(1);
const userPageSize = 15;
const categoryClass = ref("0");
const typeClass = ref(0);
const mainShow = ref(false);
const nid = ref("");
const noteDTO = ref<NoteDTO>({
  keyword: "",
  type: 0,
  cid: "",
  cpid: "",
});
const loadingMore = ref(false);
const isShowUser = ref(false);
const userDataList = ref<Array<any>>([]);
const userTotal = ref(0);

const getUserData = () => {
  typeClass.value = 3;
  isShowUser.value = true;
  currentUserPage.value = 1;
  userDataList.value = [];
  getUserByKeyword(currentUserPage.value, userPageSize, noteDTO.value.keyword).then((res: any) => {
    const { records, total } = res.data;
    userDataList.value.push(...records);
    userTotal.value = total;
  });
};

const follow = (fid: string, index: number, type: number) => {
  followById(fid).then(() => {
    userDataList.value[index].isFollow = type == -1;
  });
};

const loadMoreUser = () => {
  botLoading.value = true;
  loadingMore.value = true;
  currentUserPage.value += 1;
  new Promise((resolve) => {
    getUserByKeyword(currentUserPage.value, userPageSize, noteDTO.value.keyword).then((res: any) => {
      const { records, total } = res.data;
      userDataList.value.push(...records);
      userTotal.value = total;
      resolve(false);
    });
  }).then((data) => {
    loadingMore.value = data as boolean;
    setTimeout(() => {
      botLoading.value = false;
    }, 500);
  });
};

watch(
  () => [route.query.keyword],
  (newVal) => {
    noteDTO.value.keyword = newVal[0] as string;
    noteDTO.value.cid = "";
    noteDTO.value.type = 0;
    categoryClass.value = "0";
    isShowUser.value = false;
    typeClass.value = 0;
    getNoteListByKeyword();
    getCategoryData();
  }
);

const getNoteByType = (type: number) => {
  isShowUser.value = false;
  noteDTO.value.type = type;
  typeClass.value = type;
  getNoteListByKeyword();
};

const toMain = (noteId: string) => {
  // router.push({ name: "main", state: { nid: nid } });
  nid.value = noteId;
  mainShow.value = true;
};

const close = () => {
  mainShow.value = false;
};

const handleLoad = (item: any) => {
  item.isLoading = true;
};

const toUser = (uid: string) => {
  router.push({ name: "user", query: { uid: uid } });
};

const refresh = () => {
  // 使用回调函数优化代码
  refreshTab(() => {
    topLoading.value = true;
    isShowUser.value = false;
    typeClass.value = 0;
    currentPage.value = 1;
    currentUserPage.value = 1;
    noteList.value = [];
    userDataList.value = [];
    setTimeout(() => {
      getNoteList();
      topLoading.value = false;
    }, 1000);
  });
};

const loadMoreData = () => {
  botLoading.value = true;
  loadingMore.value = true;
  currentPage.value += 1;
  new Promise((resolve) => {
    getNoteByDTO(currentPage.value, pageSize, noteDTO.value).then((res) => {
      setData(res);
      resolve(false);
    });
  }).then((data) => {
    loadingMore.value = data as boolean;
    setTimeout(() => {
      botLoading.value = false;
    }, 500);
  });
};

const setData = (res: any) => {
  const { records, total } = res.data;
  noteTotal.value = total;
  noteList.value.push(...records);
};

const getNoteList = () => {
  noteDTO.value.type = 0;
  noteDTO.value.cid = "";
  categoryClass.value = "0";
  noteList.value = [] as Array<any>;
  currentPage.value = 1;
  getNoteByDTO(currentPage.value, pageSize, noteDTO.value).then((res) => {
    setData(res);
  });
};

const getNoteListByCategory = (id: string) => {
  categoryClass.value = id;
  noteDTO.value.cid = id;
  noteList.value = [] as Array<any>;
  currentPage.value = 1;
  getNoteByDTO(currentPage.value, pageSize, noteDTO.value).then((res) => {
    setData(res);
  });
};

const getNoteListByKeyword = () => {
  noteList.value = [] as Array<any>;
  currentPage.value = 1;
  getNoteByDTO(currentPage.value, pageSize, noteDTO.value).then((res) => {
    setData(res);
  });
};

const getCategoryData = () => {
  getCategoryAgg(noteDTO.value).then((res: any) => {
    categoryList.value = res.data;
  });
};

const initData = () => {
  const keyword = route.query.keyword as string;
  if (keyword.trim().length > 0) {
    noteDTO.value.keyword = keyword as string;
    noteDTO.value.cid = "";
    categoryClass.value = "0";
    getNoteListByKeyword();
    getCategoryData();
  }
};

initData();
</script>

<style lang="less" scoped>
.feeds-page {
  flex: 1;
  padding: 0 1.5rem;
  padding-top: 4.5rem;
  height: 100vh;
  position: relative;

  .middle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .channel-scroll-container {
      position: relative;
      overflow: hidden;
      display: flex;
      user-select: none;
      -webkit-user-select: none;
      align-items: center;
      font-size: 1rem;
      color: rgba(51, 51, 51, 0.8);
      height: 2.5rem;
      white-space: nowrap;
      height: 4.5rem;

      .content-container {
        display: flex;
        overflow-x: scroll;
        overflow-y: hidden;
        white-space: nowrap;
        color: rgba(51, 51, 51, 0.8);

        .channel {
          height: 2.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 1rem;
          cursor: pointer;
          -webkit-user-select: none;
          user-select: none;
        }
        .active {
          font-weight: 600;
        }

        .active,
        .channel:hover {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 62.4375rem;
          color: #333;
        }
      }
    }
  }

  .filter-box {
    display: flex;
    align-items: center;
    justify-content: center;

    .filter {
      height: 2.5rem;
      font-size: 1rem;
      line-height: 120%;
      color: rgba(51, 51, 51, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      -webkit-user-select: none;
      user-select: none;
      padding: 0 1rem;
    }
  }

  .divider.rec-filter {
    height: 0.0625rem;
    background: rgba(0, 0, 0, 0.08);
  }

  .channel-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;

    .channel-scroll-container {
      backdrop-filter: blur(1.25rem);
      background-color: transparent;
      width: calc(100vw - 1.5rem);

      position: relative;
      overflow: hidden;
      display: flex;
      user-select: none;
      -webkit-user-select: none;
      align-items: center;
      font-size: 1rem;
      color: rgba(51, 51, 51, 0.8);
      height: 2.5rem;
      white-space: nowrap;
      height: 4.5rem;

      .content-container::-webkit-scrollbar {
        display: none;
      }

      .content-container {
        display: flex;
        overflow-x: scroll;
        overflow-y: hidden;
        white-space: nowrap;
        color: rgba(51, 51, 51, 0.8);

        .active {
          font-weight: 600;
          background: rgba(226, 86, 105, 0.06);
          color: #ff2442;
        }

        .channel {
          height: 2.5rem;
          margin-right: 0.75rem;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 1rem;
          cursor: pointer;
          -webkit-user-select: none;
          user-select: none;
          //background: rgba(0, 0, 0, 0.03);
          border-radius: 0.625rem;
        }
      }
    }
  }

  .feeds-container {
    position: relative;
    transition: width 0.5s;
    margin: 0 auto;

    .feeds-loading {
      margin: 3vh;
      text-align: center;
    }

    .feeds-loading-top {
      text-align: center;
      line-height: 6vh;
      height: 6vh;
    }

    .noteImg {
      width: 15rem;
      max-height: 18.75rem;
      object-fit: cover;
      border-radius: 0.5rem;
    }

    .footer {
      padding: 0.75rem;

      .title {
        margin-bottom: 0.5rem;
        word-break: break-all;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        font-weight: 500;
        font-size: 0.875rem;
        line-height: 140%;
        color: #333;
      }

      .author-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 1.25rem;
        color: rgba(51, 51, 51, 0.8);
        font-size: 0.75rem;
        transition: color 1s;

        .author {
          display: flex;
          align-items: center;
          color: inherit;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 0.75rem;

          .author-avatar {
            margin-right: 0.375rem;
            width: 1.25rem;
            height: 1.25rem;
            border-radius: 1.25rem;
            border: 0.0625rem solid rgba(0, 0, 0, 0.08);
            flex-shrink: 0;
            object-fit: cover;
          }

          .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .like-wrapper {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;

          .count {
            margin-left: 0.125rem;
          }
        }
      }
    }
  }

  .floating-btn-sets {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 2.5rem;
    grid-gap: 0.5rem;
    gap: 0.5rem;
    right: 1.5rem;
    bottom: 1.5rem;

    .back-top {
      width: 2.5rem;
      height: 2.5rem;
      background: #fff;
      border: 0.0625rem solid rgba(0, 0, 0, 0.08);
      border-radius: 6.25rem;
      color: rgba(51, 51, 51, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      // transition: background 0.2s;
      cursor: pointer;
    }

    .reload {
      width: 2.5rem;
      height: 2.5rem;
      background: #fff;
      border: 0.0625rem solid rgba(0, 0, 0, 0.08);
      box-shadow:
        0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.1),
        0 0.0625rem 0.125rem 0 rgba(0, 0, 0, 0.02);
      border-radius: 6.25rem;
      color: rgba(51, 51, 51, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      //transition: background 0.2s;
      cursor: pointer;
    }
  }

  .agree-container {
    .agree-item {
      display: flex;
      flex-direction: row;
      padding-top: 1.5rem;

      .user-avatar {
        margin-right: 1.5rem;
        flex-shrink: 0;

        .avatar-item {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 100%;
          border: 0.0625rem solid rgba(0, 0, 0, 0.08);
          object-fit: cover;
        }
      }

      .main {
        flex-grow: 1;
        flex-shrink: 1;
        display: flex;
        flex-direction: row;
        padding-bottom: 0.75rem;
        border-bottom: 0.0625rem solid rgba(0, 0, 0, 0.08);

        .info {
          flex-grow: 1;
          flex-shrink: 1;

          .user-info {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.25rem;

            a {
              color: #333;
              font-size: 1rem;
              font-weight: 600;
            }
          }

          .interaction-hint {
            font-size: 0.875rem;
            color: rgba(51, 51, 51, 0.6);
            margin-bottom: 0.5rem;
          }

          .interaction-content {
            display: flex;
            font-size: 0.875rem;
            color: #333;
            line-height: 140%;
            cursor: pointer;
            margin-bottom: 0.75rem;

            .msg-count {
              width: 1.25rem;
              height: 1.25rem;
              line-height: 1.25rem;
              font-size: 0.8125rem;
              color: #fff;
              background-color: red;
              text-align: center;
              border-radius: 100%;
            }
          }

          .quote-info {
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            color: rgba(51, 51, 51, 0.6);
            margin-bottom: 0.75rem;
            cursor: pointer;
          }

          .quote-info::before {
            content: "";
            display: inline-block;
            border-radius: 0.5rem;
            margin-right: 0.375rem;
            width: 0.25rem;
            height: 1.0625rem;
            background: rgba(0, 0, 0, 0.08);
          }
        }

        .extra {
          min-width: 3rem;
          flex-shrink: 0;
          margin-left: 1.5rem;

          .follow-button {
            width: 6rem;
          }

          .reds-button-new.large {
            font-size: 1rem;
            font-weight: 600;
            line-height: 1rem;
            padding: 0 1.5rem;
            height: 2.5rem;
          }

          .reds-button-new.primary {
            background-color: #ff2e4d;
            color: #fff;
          }

          .reds-button-new {
            position: relative;
            cursor: pointer;
            -webkit-user-select: none;
            user-select: none;
            white-space: nowrap;
            outline: none;
            background: none;
            border: none;
            vertical-align: middle;
            text-align: center;
            display: inline-block;
            padding: 0;
            border-radius: 6.25rem;
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>
