<!-- Пример использование компонента BaseInput -->

# Телефон (Узбекистан uz)

<BaseInput
  v-model="phone"
  label="Телефон"
  placeholder="+998 (__) ___-__-__"
  type="tel"
  :mask="'+998 (##) ###-##-##'"
/>

---

# для Email

<BaseInput
  v-model="email"
  label="Email"
  type="email"
  placeholder="example@mail.com"
/>

---

# для пароль

<BaseInput
  v-model="password"
  label="Пароль"
  type="password"
/>

---

# для ошибки

<BaseInput
  v-model="email"
  label="Email"
  error="Неверный email"
/>

---

# для подсказки

<BaseInput
  v-model="username"
  label="Username"
  hint="Минимум 6 символов"
/>

---

<!-- --------------------------------------------- -->

<!-- Модули для слайдера -->

1. Virtual - Virtual Slides module
2. Keyboard - Keyboard Control module
3. Mousewheel - Mousewheel Control module
4. Navigation - Navigation module
5. Pagination - Pagination module
6. Scrollbar - Scrollbar module
7. Parallax - Parallax module
8. FreeMode - Free Mode module
9. Grid - Grid module
10. Manipulation - Slides manipulation module (only for Core version)
11. Zoom - Zoom module
12. Controller - Controller module
13. A11y - Accessibility module
14. History - History Navigation module
15. HashNavigation - Hash Navigation module
16. Autoplay - Autoplay module
17. EffectFade - Fade Effect module
18. EffectCube - Cube Effect module
19. EffectFlip - Flip Effect module
20. EffectCoverflow - Coverflow Effect module
21. EffectCards - Cards Effect module
22. EffectCreative - Creative Effect module
23. Thumbs - Thumbs module
---

<!-- --------------------------------------------- -->

#how to use accordion btn

const items = [
  {
    title: "How it works?",
    content: "Simple text...",
  },
  {
    title: "Step-by-step guide",
    content: [
      "Upload images",
      "Choose layout",
      "Download album",
    ],
  },
];
<BaseAccordion :items="accordionData" :defaultOpenIndex="0" />

<!-- --------------------------------------------- -->

