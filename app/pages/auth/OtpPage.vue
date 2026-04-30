<script setup lang="ts">
import BaseButton from "~/components/ui/BaseButton.vue";
import { ref, onMounted } from "vue";

definePageMeta({
  layout: "auth",
});

const OTP_LENGTH = 4;

/** =======  STATE ======= */
const inputs = ref<HTMLInputElement[]>([]);
const values = ref<string[]>(Array(OTP_LENGTH).fill(""));
const activeIndex = ref(0);

const isError = ref(false);
const isComplete = ref(false);

/** =======  FOCUS HANDLER ======= */
function focusInput(index: number) {
  const el = inputs.value[index];
  if (el) el.focus();
}

/** =======  INPUT HANDLER ======= */
function onInput(e: Event, index: number) {
  const target = e.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, "").slice(-1);

  values.value[index] = value;
  if (value && index < OTP_LENGTH - 1) {
    focusInput(index + 1);
  }
  checkComplete();
}

/** =======  BACKSPACE HANDLER ======= */
function onKeydown(e: KeyboardEvent, index: number) {
  if (e.key === "Backspace") {
    if (values.value[index]) {
      values.value[index] = "";
    } else if (index > 0) {
      values.value[index - 1] = "";
      focusInput(index - 1);
    }
    checkComplete();
  }
}

/** ======= PASTE HANDLER (FULL OTP) ======= */
function onPaste(e: ClipboardEvent) {
  e.preventDefault();

  const text = e.clipboardData?.getData("text") || "";
  const digits = text.replace(/\D/g, "").slice(0, OTP_LENGTH);

  digits.split("").forEach((d, i) => {
    values.value[i] = d;
  });
  const next = digits.length >= OTP_LENGTH ? OTP_LENGTH - 1 : digits.length;
  focusInput(next);

  checkComplete();
}

/** ======= COMPLETE CHECK ======= */
function checkComplete() {
  isComplete.value =
    values.value.join("").length === OTP_LENGTH && !values.value.includes("");
}

/** ======= COMPLETE EVENT ======= */
function handleSubmit() {
  if (!isComplete.value) return;

  const code = values.value.join("");
  console.log("OTP:", code);
  navigateTo("/auth/LoginName");

  // тут отправка на backend
}

/** ============== */
onMounted(() => {
  focusInput(0);
});
</script>

<template>
  <div class="otp-page-wrapper">
    <div class="otp-header-content">
      <h3 class="otp-header">Confirm your phone</h3>
      <p class="otp-description">
        We've sent you 4-digit code, please enter code below:
      </p>
    </div>

    <div class="otp-form-wrapper" :class="{ shake: isError }">
      <input
        v-for="(val, i) in values"
        :key="i"
        ref="inputs"
        v-model="values[i]"
        maxlength="1"
        inputmode="numeric"
        class="otp-input"
        @input="onInput($event, i)"
        @keydown="onKeydown($event, i)"
        @paste="onPaste"
      />
    </div>

    <div class="confirm-btn-wrapper">
      <BaseButton
        variant="primary"
        size="sm"
        :disabled="!isComplete"
        @click="handleSubmit"
      >
        Confirm
      </BaseButton>

      <NuxtLink to="/auth/LoginPage" class="change-phone-link">
        Change phone number
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.otp-page-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 32px;
  height: 100vh;
}

.otp-page-wrapper .otp-header-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.otp-page-wrapper .otp-header-content .otp-header {
  font-size: 24px;
  font-weight: 600;
  color: var(--black-color);
}

.otp-page-wrapper .otp-header-content .otp-description {
  font-size: 16px;
  font-weight: 400;
  color: var(--black-grey-color);
}

.otp-header {
  font-size: 22px;
  font-weight: 600;
}

.otp-description {
  font-size: 14px;
  opacity: 0.7;
  text-align: center;
  max-width: 260px;
}

/* OTP INPUTS */
.otp-form-wrapper {
  display: flex;
  gap: 16px;
}

.otp-input {
  width: 78px;
  height: 85px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  border-radius: var(--border-radius-circular);
  border: 1px solid var(--display-grey-color);
  background: var(--white-color);
  color: var(--black-color);
  outline: none;
  transition: 0.2s;
}

.otp-input:focus {
  border-color: var(--btn-color);
}

.confirm-btn-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.confirm-btn-wrapper .change-phone-link {
  font-size: 16px;
  font-weight: 400;
  border-bottom: 1px solid var(--black-color);
  color: var(--black-color);
}

/* SHAKE ERROR */
.shake {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  50% {
    transform: translateX(5px);
  }

  75% {
    transform: translateX(-5px);
  }

  100% {
    transform: translateX(0);
  }
}
</style>
