// Album + rasm yuklash (himoyalangan — JWT kerak).

export interface ApiPhoto {
  id: string;
  albumId?: string;
  originalUrl: string | null;
  thumbnailUrl: string | null;
  fileName: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isDuplicate: boolean;
  isLowQuality: boolean;
  status: string;
}

export interface ApiAlbum {
  id: string;
  templateId: string | null;
  status: string;
  pageCount: number;
  designData: unknown | null;
  coverPhotoId: string | null;
  processingProgress?: number;
  processingStep?: string | null;
  photos?: ApiPhoto[];
}

export function useAlbums() {
  const { get, post, patch, del, $api } = useApi();

  function createAlbum(input: { templateId: string | null; pageCount: number }) {
    return post<ApiAlbum>("/albums", input);
  }

  // Rasmlarni bo'laklarga bo'lib (har bir so'rov ~25MB / 20 ta gacha) ketma-ket yuklaymiz.
  // Bitta ulkan so'rov o'rniga — nginx limitidan oshmaydi va ishonchliroq.
  async function uploadPhotos(albumId: string, files: File[]): Promise<ApiPhoto[]> {
    const MAX_BATCH_BYTES = 25 * 1024 * 1024;
    const MAX_BATCH_COUNT = 20;

    const batches: File[][] = [];
    let current: File[] = [];
    let currentBytes = 0;
    for (const file of files) {
      if (
        current.length > 0 &&
        (currentBytes + file.size > MAX_BATCH_BYTES || current.length >= MAX_BATCH_COUNT)
      ) {
        batches.push(current);
        current = [];
        currentBytes = 0;
      }
      current.push(file);
      currentBytes += file.size;
    }
    if (current.length > 0) batches.push(current);

    const uploaded: ApiPhoto[] = [];
    for (const batch of batches) {
      const form = new FormData();
      batch.forEach((f) => form.append("photos", f, f.name));
      // Content-Type'ni o'chiramiz — brauzer multipart boundary'ni o'zi qo'yadi
      const res = await $api.post(`/albums/${albumId}/photos`, form, {
        headers: { "Content-Type": undefined },
      });
      uploaded.push(...(res.data.data as ApiPhoto[]));
    }
    return uploaded;
  }

  async function replacePhoto(albumId: string, photoId: string, file: File): Promise<ApiPhoto> {
    const form = new FormData();
    form.append("photo", file, file.name);
    const res = await $api.put(`/albums/${albumId}/photos/${photoId}`, form, {
      headers: { "Content-Type": undefined },
    });
    return res.data.data as ApiPhoto;
  }

  return {
    createAlbum,
    uploadPhotos,
    replacePhoto,
    listAlbums: () => get<ApiAlbum[]>("/albums"),
    getAlbum: (id: string) => get<ApiAlbum>(`/albums/${id}`),
    deleteAlbum: (id: string) => del(`/albums/${id}`),
    listPhotos: (id: string) => get<ApiPhoto[]>(`/albums/${id}/photos`),
    deletePhoto: (albumId: string, photoId: string) =>
      del(`/albums/${albumId}/photos/${photoId}`),
    startProcessing: (id: string) => post<ApiAlbum>(`/albums/${id}/process`),
    setCover: (id: string, photoId: string) => patch<ApiAlbum>(`/albums/${id}/cover`, { photoId }),
    saveDesign: (id: string, designData: unknown) =>
      patch<ApiAlbum>(`/albums/${id}/design`, { designData }),
  };
}
