<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const { completeProfile, errorMessage } = useAuth()

const name = ref('');
const loading = ref(false)
const errorText = ref('')

definePageMeta({
    layout: "auth",
})

const handleSubmit = async () => {
    if (!name.value || loading.value) return
    errorText.value = ''
    loading.value = true
    try {
        await completeProfile(name.value.trim())
        await navigateTo('/')
    } catch (e) {
        errorText.value = errorMessage(e, 'Saqlashda xatolik')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="login-name-page-wrapper">
        <div class="logo-wrapper">
            <img src="../../assets/images/logo-main.png" alt="logo" class="logo">
        </div>

        <div class="login-name-form-wrapper">
            <BaseInput v-model="name" label="Full name" placeholder="Enter your name" />
            <BaseButton variant="primary" size="sm" :disabled="!name || loading" @click="handleSubmit">
                {{ loading ? '...' : 'Continue' }}
            </BaseButton>
            <p v-if="errorText" class="login-name-error">{{ errorText }}</p>
        </div>
    </div>
</template>

<style scoped>
.login-name-page-wrapper {
    display: flex;
    flex-direction: column;
    gap: 38px;
    padding: 16px 0;
}

.login-name-page-wrapper .logo-wrapper img {
    width: 100%;
    max-width: 173px;
}

.login-name-page-wrapper .login-name-form-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
}
</style>