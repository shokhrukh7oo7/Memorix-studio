<script setup lang="ts">
import logo from 'assets/images/logo.png'
const { isLoading } = useAppLoader()
</script>

<template>
    <ClientOnly>
        <div v-if="isLoading" class="page-loader">
            <div class="loader-wrapper">
                <span class="icon">
                    <img :src="logo" alt="Memorix Logo" />
                </span>
                <div class="spinner">
                    <span class="text">Memorix...</span>
                </div>
            </div>
        </div>
    </ClientOnly>
</template>

<style>
.loader-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.spinner {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 30px;
    background: radial-gradient(circle closest-side, #000 94%, #0000) right / calc(200% - 1em) 100%;
    animation: l24 1s infinite alternate linear;
}

.text {
    line-height: 1em;
    color: #0000;
    background: inherit;
    background-image: radial-gradient(circle closest-side, #fff 94%, #000);
    -webkit-background-clip: text;
    background-clip: text;
}

.icon img {
    width: 32px;
    height: 32px;
}


@keyframes l24 {
    100% {
        background-position: left
    }
}
</style>