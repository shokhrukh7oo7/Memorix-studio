// Public kontent endpointlari (auth talab qilmaydi).

export interface ApiBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  buttonText: string;
  buttonLink: string | null;
  promoCode: string | null;
  promoText: string | null;
  countdownTo: string | null;
}
export interface ApiNamed {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}
export interface ApiInfoSlide {
  id: string;
  type: string;
  image: string | null;
  text: string;
  description: string;
  buttonText: string | null;
  buttonLink: string | null;
  isDark: boolean;
}
export interface ApiTemplate {
  id: string;
  title: string;
  colorName: string;
  description: string;
  images: string[];
  pageOptions: number[];
  category?: { id: string; name: string; slug: string } | null;
  country?: { id: string; name: string } | null;
  isBestSeller: boolean;
  isPopular: boolean;
}
export interface ApiFaq {
  id: string;
  question: string;
  answer: string;
}
export interface ApiHome {
  banners: ApiBanner[];
  categories: ApiNamed[];
  infoSlides: ApiInfoSlide[];
}
export interface ApiPricing {
  photobook: {
    coverType: string;
    size: string;
    paperFinish: string;
    pageOptions: { pages: number; price: number; oldPrice: number | null }[];
    extraPagePrice: number;
    currency: string;
  };
  extraServices: { id: string; name: string; description: string; price: number; image: string | null }[];
}
export interface ApiRegion {
  id: string;
  name: string;
  deliveryFee: number;
  freeDeliveryFrom: number | null;
}

export function useContent() {
  const { get } = useApi();

  return {
    getHome: () => get<ApiHome>("/home"),
    getCategories: () => get<ApiNamed[]>("/categories"),
    getCountries: () => get<ApiNamed[]>("/countries"),
    getFaq: () => get<ApiFaq[]>("/faq"),
    getInfoSlides: (type?: string) =>
      get<ApiInfoSlide[]>("/info-slides", type ? { params: { type } } : undefined),
    getTemplates: () => get<ApiTemplate[]>("/templates"),
    getTemplate: (id: string) => get<ApiTemplate>(`/templates/${id}`),
    getCategoriesTree: () => get<unknown>("/templates/categories-tree"),
    getPricing: () => get<ApiPricing>("/products/pricing"),
    getRegions: () => get<ApiRegion[]>("/regions"),
    getEditorResources: () => get<unknown>("/editor/resources"),
  };
}
