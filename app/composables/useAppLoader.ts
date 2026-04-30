export const useAppLoader = () => {
  const loading = useState<number>('app-loading', () => 0)

  const start = () => {
    loading.value++
  }

  const stop = () => {
    if (loading.value > 0) loading.value--
  }

  const isLoading = computed(() => loading.value > 0)

  return { loading, isLoading, start, stop }
}
