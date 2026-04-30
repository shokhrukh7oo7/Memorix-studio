export const getBrightness = (imageSrc: string): Promise<'light' | 'dark'> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = imageSrc;
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve('light');

            canvas.width = 1; // Нам достаточно 1 пикселя для среднего значения
            canvas.height = 1;

            ctx.drawImage(img, 0, 0, 1, 1);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

            // Формула яркости (YIQ)
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            resolve(brightness > 128 ? 'light' : 'dark');
        };

        img.onerror = () => resolve('light');
    });
};