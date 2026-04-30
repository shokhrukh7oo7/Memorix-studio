<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary' | 'disabled'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
    variant?: Variant
    size?: Size
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
}>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    type: 'button'
})

const classes = computed(() => {
    return [
        'btn',
        `btn--${props.variant}`,
        `btn--${props.size}`,
        {
            'is-disabled': props.disabled
        }
    ]
})

</script>

<template>
    <button :type="type" :class="classes" :disabled="disabled">
        <span class="btn__content">
            <slot />
        </span>
    </button>
</template>

<style scoped>
.btn {
    border-radius: var(--border-radius-zero);
    font-weight: 500;
    transition: all 0.2s ease;
    border: none;
    padding: 12px 10px;
    width: 100%;
}

/* sizes start */
.btn--sm {
    font-size: 14px;
}

.btn--md {
    font-size: 16px;
}

.btn--lg {
    font-size: 18px;
}

/* btn primary start */
.btn--primary {
    background: var(--btn-color);
    color: var(--white-color);
}

.btn--primary:hover {
    background: var(--btn-color-hover);
}

/* btn secondary start */
.btn--secondary {
    background: var(--white-color);
    color: var(--btn-color);
}

.btn--secondary:hover {
    background: var(--white-black-color);
}

/* btn disabled start */
/* .btn--disabled {
    background: var(--display-grey-color);
    color: var(--grey-color);
} */

.btn:disabled {
    background: var(--display-grey-color);
    color: var(--grey-color);
    cursor: not-allowed;
}

/* disabled start */
.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>