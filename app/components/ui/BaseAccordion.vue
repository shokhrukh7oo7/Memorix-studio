<script setup lang="ts">
import { ref } from "vue";
import BaseAccordionItem from "./BaseAccordionItem.vue";
// import FaqItem from "./FaqAItem.vue";

export type AccordionItemType = {
  title: string;
  content: string | string[];
};

const props = defineProps<{
  items: AccordionItemType[];
  defaultOpenIndex?: number;
}>();

const activeIndex = ref<number | null>(props.defaultOpenIndex ?? null);

const toggle = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};
</script>

<template>
  <div class="accordion-wrapper">
    <BaseAccordionItem
      v-for="(item, index) in items"
      :key="index"
      :title="item.title"
      :content="item.content"
      :isOpen="activeIndex === index"
      @toggle="toggle(index)"
    >
      <div>
        <p v-if="typeof item.content === 'string'">
          {{ item.content }}
        </p>

        <ul v-else>
          <li v-for="(li, i) in item.content" :key="i">
            {{ li }}
          </li>
        </ul>
      </div>
    </BaseAccordionItem>
  </div>
</template>

<style scoped>
.accordion-wrapper {
  width: 100%;
  margin: auto;
}

.faq-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
