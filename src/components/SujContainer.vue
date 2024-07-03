<template>
  <div class="sug-container-wrapper query-trending sug-pad">
    <div class="sug-container query-trending">
      <div class="history" v-show="historyRecordList != null && historyRecordList.length > 0">
        <div class="header">
          <span> 历史记录 </span>
          <div class="icon-group">
            <div class="icon-box" @click="showDeleteTag">
              <Delete style="width: 1.2em; height: 1.2em"></Delete>
            </div>
            <!---->
          </div>
        </div>
        <div class="history-list">
          <div v-for="(item, index) in historyRecordList" :key="index">
            <div class="history-item">
              <span @click="searchPage(item)">{{ item }}</span>
              <!---->
              <span class="close-tag" v-show="showTagState" @click="deleteRecord(index)">X</span>
            </div>
          </div>
          <!---->
        </div>
      </div>
      <div class="sug-box">
        <div class="header">猜你想搜</div>
        <div class="sug-wrapper">
          <div
            class="sug-item query-trending query-trending hotspot"
            v-for="(item, index) in recommendRecords"
            :key="index"
          >
            <div class="sug-text" @click="searchPage(item)">
              {{ item }}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="hotspots">
          <div class="header">
            <span style="color: #888888">热点</span>
            <img src="@/assets/images/3.png" class="redian" crossorigin="anonymous" />
          </div>
          <div class="hotspot-list">
            <div class="hotspot-item" v-for="(item, index) in hotList" :key="index">
              <p class="hotspot-index">{{ index + 1 }}</p>
              <div class="hotspot-title" @click="searchPage(item.content)">
                <span class="text">{{ item.content }}</span>
                <img src="@/assets/images/1.png" crossorigin="anonymous" />
                <img v-show="item.searchCount > 10" src="@/assets/images/2.png" crossorigin="anonymous" />
              </div>
              <span class="hotspot-score">{{ item.searchCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Delete } from "@element-plus/icons-vue";
import { ref, onMounted, watch } from "vue";
import { useSearchStore } from "@/store/searchStore";
import { getHotRecord, addRecord } from "@/api/search";
import { getRandomString } from "@/utils/util";
import { storage } from "@/utils/storage";
import { useRouter } from "vue-router";

const router = useRouter();
const searchStore = useSearchStore();

const historyRecordList = ref<Array<string>>([]);
const hotList = ref<Array<any>>([]);
const showTagState = ref(false);
const recommendRecords = ["壁纸", "风景", "情侣", "头像", "动漫", "动物"];

const props = defineProps({
  closeHistoryRecord: {
    type: Boolean,
    default: false,
  },
});

const showDeleteTag = () => {
  showTagState.value = !showTagState.value;
};

const deleteRecord = (index: number) => {
  historyRecordList.value.splice(index, 1);
  // 使用store失效
  storage.set("historyRecords", historyRecordList.value);
};

watch(
  () => [searchStore.seed, props.closeHistoryRecord],
  () => {
    showTagState.value = false;
    historyRecordList.value = searchStore.getRecords();
    getHotRecord().then((res) => {
      hotList.value = res.data;
    });
  }
);

const searchPage = (keyword: string) => {
  addRecord(keyword);
  searchStore.setKeyword(keyword);
  searchStore.pushRecord(keyword);
  const seed = getRandomString(12);
  searchStore.setSeed(seed);
  router.push({ name: "search", query: { keyword: keyword } });
};

onMounted(() => {
  historyRecordList.value = searchStore.getRecords();
  getHotRecord().then((res) => {
    hotList.value = res.data;
  });
});
</script>
<style lang="less" scoped>
.redian {
  width: 90px;
  margin-left: 8px;
}
//隐藏滚动条
.sug-container-wrapper::-webkit-scrollbar {
  display: none;
}

.sug-container-wrapper.query-trending {
  position: relative;
  padding-top: 100%;
}

.sug-container-wrapper {
  margin-top: 0.5rem;
  width: 100%;
  background-color: #fff;
  box-shadow:
    0 0.25rem 2rem 0 rgba(0, 0, 0, 0.08),
    0 0.0625rem 0.25rem 0 rgba(0, 0, 0, 0.04);
  border-radius: 0.75rem;
  overflow: scroll;
  z-index: 9999;
}

.sug-container.query-trending {
  width: 100%;
  position: absolute;
  top: 0;

  .history {
    padding: 0.25rem;

    .header {
      display: flex;
      padding: 0 0.25rem 0 0.75rem;
      align-items: center;
      height: 2rem;
      font-style: normal;
      font-weight: 400;
      font-size: 0.75rem;
      line-height: 120%;
      color: rgba(51, 51, 51, 0.6);

      .icon-group {
        display: flex;
        margin-left: auto;
        font-size: 0.75rem;
        font-weight: 400;
        color: rgba(51, 51, 51, 0.8);
        grid-gap: 0.25rem;
        gap: 0.25rem;

        .icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 1.5rem;
          width: 1.5rem;
          grid-gap: 0.25rem;
          gap: 0.25rem;
          padding: 0 0.25rem;
          cursor: pointer;
        }
      }
    }

    .history-list {
      display: flex;
      align-items: center;
      padding: 0 0.5rem 0.5rem;
      flex-wrap: wrap;
      position: relative;
      grid-gap: 0.5rem;
      gap: 0.5rem;

      .close-tag {
        position: absolute;
        top: -0.5rem;
        right: 0;
        width: 1rem;
        height: 1rem;
        text-align: center;
        line-height: 1rem;
        background-color: #fff;
        border-radius: 50%;
        color: #888888;
        border: 0.0625rem solid #f4f4f4;
        z-index: 99999;
      }

      .history-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 2rem;
        color: rgba(51, 51, 51, 0.8);
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 120%;
        padding: 0 0.75rem;
        white-space: nowrap;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 62.4375rem;
        border: 0.0625rem solid transparent;
        cursor: pointer;
      }
      :hover {
        cursor: pointer; /* 显示小手指针 */
        transform: scale(1.1); /* 鼠标移入时按钮稍微放大 */
      }
    }
  }

  .sug-box {
    padding: 0.25rem;

    .header {
      display: flex;
      padding: 0.6563rem 0.75rem;
      align-items: center;
      height: 2rem;
      font-style: normal;
      font-weight: 400;
      font-size: 0.75rem;
      line-height: 120%;
      color: rgba(51, 51, 51, 0.6);
    }

    .sug-wrapper {
      display: flex;
      flex-wrap: wrap;

      .query-trending.hotspot:nth-child(odd) {
        margin-right: 0.125rem;
      }

      .query-trending.hotspot {
        width: calc(50% - 0.125rem);
      }

      .query-trending {
        color: rgba(51, 51, 51, 0.8);
        width: 100%;
      }

      .sug-item {
        width: 100%;
        padding: 0 0.75rem;
        font-size: 1rem;
        height: 2.5rem;
        line-height: 120%;
        font-weight: 400;
        border-radius: 0.5rem;
        color: rgba(51, 51, 51, 0.6);
        display: flex;
        align-items: center;
      }

      .sug-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 1.25rem;
        cursor: pointer;
      }
      :hover {
        cursor: pointer; /* 显示小手指针 */
        transform: scale(1.1); /* 鼠标移入时按钮稍微放大 */
        transform-origin: left center; /* 调整缩放基点为左边中心 */
      }
    }
  }

  .hotspots {
    padding: 0.25rem;

    .header {
      padding: 0.5rem 0.75rem;
      height: 2rem;
    }

    .hotspot-item:first-child {
      color: #ff2442;
    }

    .hotspot-item:nth-child(2) {
      color: rgb(128, 0, 94);
    }

    .hotspot-item:nth-child(3) {
      color: #ff24a4;
    }

    .hotspot-item {
      padding: 0 0.75rem;
      display: flex;
      align-items: center;
      height: 2.5rem;
      cursor: pointer;
      color: rgba(51, 51, 51, 0.6);

      .hotspot-index {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 0.875rem;
        line-height: 120%;
        width: 1rem;
        height: 1rem;
      }

      .hotspot-title {
        margin: 0 0.375rem;
        color: rgba(51, 51, 51, 0.8);
        font-weight: 400;
        font-size: 1rem;
        line-height: 120%;
        display: flex;
        align-items: center;
        height: 100%;
        flex: 1;

        img {
          margin-left: 0.375rem;
          height: 0.975rem;
        }

        .text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      :hover {
        cursor: pointer; /* 显示小手指针 */
        transform: scale(1.1); /* 鼠标移入时按钮稍微放大 */
        transform-origin: left center; /* 调整缩放基点为左边中心 */
      }

      .hotspot-score {
        color: rgba(51, 51, 51, 0.3);
        margin-left: auto;
        font-weight: 400;
        font-size: 0.75rem;
        line-height: 120%;
      }
    }
  }
}

.sug-container.query-trending {
  width: 100%;
  position: absolute;
  top: 0;
}
</style>
