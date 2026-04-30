import { ref, onMounted, onUnmounted } from "vue";

export function useTimer(targetDate: Date) {
    const days = ref("00");
    const hours = ref("00");
    const minutes = ref("00");
    const seconds = ref("00");

    let interval: ReturnType<typeof setInterval>;

    const format = (num: number) => String(num).padStart(2, "0");

    const updateTimer = () => {
        const now = new Date().getTime();
        const target = targetDate.getTime();
        const diff = target - now;

        if (diff <= 0) {
            days.value = "07";
            hours.value = "23";
            minutes.value = "59";
            seconds.value = "58";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        days.value = format(d);
        hours.value = format(h);
        minutes.value = format(m);
        seconds.value = format(s);
    };

    onMounted(() => {
        updateTimer();
        interval = setInterval(updateTimer, 1000);
    });

    onUnmounted(() => {
        clearInterval(interval);
    });

    return {
        days,
        hours,
        minutes,
        seconds,
    };
}
