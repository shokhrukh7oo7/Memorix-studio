<script setup lang="ts">
import { ref, computed } from 'vue'

// props
const props = withDefaults(defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    type?: 'text' | 'email' | 'password' | 'tel'
    mask?: string
    disabled?: boolean
    error?: string
    hint?: string
}>(), {
    type: 'text'
})

// emit
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

// password toggle
const showPassword = ref(false)

const inputType = computed(() => {
    if (props.type === 'password') {
        return showPassword.value ? 'text' : 'password'
    }
    return props.type
})

// input handler
const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement | null
    if (!target) return
    emit('update:modelValue', target.value)
}
</script>

<template>
    <div class="input-wrapper">

        <!-- label -->
        <label v-if="label" class="label">
            {{ label }}
        </label>

        <!-- input container -->
        <div class="input-container" :class="{
            error: error,
            disabled: disabled
        }">
            <input :type="inputType" :placeholder="placeholder" :value="modelValue" :disabled="disabled" v-maska="mask"
                @input="onInput" class="input" />

            <!-- password toggle -->
            <button v-if="type === 'password'" type="button" class="toggle" @click="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
            </button>
        </div>

        <!-- error -->
        <span v-if="error" class="error-text">
            {{ error }}
        </span>

        <!-- hint -->
        <span v-else-if="hint" class="hint">
            {{ hint }}
        </span>

    </div>
</template>

<style scoped>
.input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.label {
    color: var(--black-color);
    font-size: 16px;
    font-weight: 400;
}

.input-container {
    position: relative;
    display: flex;
    align-items: center;
}

.input {
    width: 100%;
    padding: 12px 16px;
    padding-right: 40px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-circular);
    color: var(--black-color);
    outline: none;
    transition: 0.2s;
    font-size: 16px;
}

.input:focus {
    border-color: var(--btn-color);
}

.input::placeholder {
    color: var(--grey-color);
}

/* error */
.input-container.error .input {
    border-color: var(--red-color);
}

/* disabled */
.input-container.disabled .input {
    background: var(--white-black-color);
    cursor: not-allowed;
}

/* toggle button */
.toggle {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
}

/* texts */
.error-text {
    color: var(--red-color);
    font-size: 14px;
}

.hint {
    color: var(--grey-color);
    font-size: 14px;
}
</style>
