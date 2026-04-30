export default defineNuxtPlugin((nuxtApp) => {
    const { start, stop } = useAppLoader()
    const router = useRouter()

    // 👉 Router
    router.beforeEach(() => {
        start()
    })

    router.afterEach(() => {
        setTimeout(stop, 300)
    })

    // 👉 Fetch (API)
    nuxtApp.hook('page:start', start)
    nuxtApp.hook('page:finish', stop)
})
