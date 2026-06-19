export interface BookCard {
  id: string;
  title: string;
  colorName: string;
  description: string;
  images: string[]; // массив из 5-6 ссылок на фото
  pageOptions?: number[];
}
