<template>
  <div class="sug-container-wrapper sug-pad">
    <div class="sug-container">
      <!---->
      <div class="sug-box">
        <!---->
        <div class="sug-wrapper">
          <div class="sug-item" v-for="(item, index) in dataList" :key="index" @click="searchPage(item.content)">
            <!---->
            <span v-html="item.highlightContent"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { getRandomString } from "@/utils/util";
import { useSearchStore } from "@/store/searchStore";
import { useRouter } from "vue-router";
import { addRecord } from "@/api/search";

const router = useRouter();

const searchStore = useSearchStore();
const props = defineProps({
  recordList: {
    type: Array<any>,
    default: [],
  },
});

const dataList = ref<Array<any>>([]);

const searchPage = (keyword: string) => {
  addRecord(keyword);
  searchStore.setKeyword(keyword);
  searchStore.pushRecord(keyword);
  const seed = getRandomString(12);
  searchStore.setSeed(seed);
  router.push({ name: "search", query: { keyword: keyword } });
};
watchEffect(() => {
  dataList.value = [];
  if (props.recordList.length > 0) {
    dataList.value = props.recordList;
  }
});
</script>
<style lang="less" scoped>
.sug-container-wrapper::-webkit-scrollbar {
  display: none;
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

  .sug-container {
    padding-top: 0.25rem;

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

    .sug-item:hover {
      background: #f8f8f8;
    }
  }
}
</style>
