import api from '@/lib/api';

const resolveImageUrl = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) {
    return '/images/placeholder.jpg';
  }

  const raw = value.trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return raw;

  return `/uploads/${raw}`;
};

export type MemoryStatus = 'pending' | 'approved' | 'rejected';

export type MemoryItem = {
  id: string;
  imageUrl: string;
  caption: string;
  userName: string;
  status: MemoryStatus;
  createdAt: string;
};

const normalizeMemory = (memory: any): MemoryItem => ({
  id: memory?.id || memory?._id || '',
  imageUrl: resolveImageUrl(memory?.imageUrl),
  caption: memory?.caption || '',
  userName:
    memory?.user?.name ||
    memory?.userName ||
    memory?.name ||
    'Camper',
  status: (memory?.status || 'pending') as MemoryStatus,
  createdAt: memory?.createdAt || new Date().toISOString(),
});

const normalizeMemoryListResponse = (response: any): MemoryItem[] => {
  const rawMemories = Array.isArray(response)
    ? response
    : Array.isArray(response?.memories)
      ? response.memories
      : Array.isArray(response?.data?.memories)
        ? response.data.memories
        : [];

  return rawMemories
    .map(normalizeMemory)
    .filter((memory: MemoryItem) => memory.id && memory.imageUrl);
};

export const uploadUserMemory = async (payload: FormData) => {
  return api.post('/memories', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getApprovedMemories = async (): Promise<MemoryItem[]> => {
  const response = await api.get('/memories');
  return normalizeMemoryListResponse(response);
};

export const getMyMemories = async (): Promise<MemoryItem[]> => {
  const response = await api.get('/memories/my');
  return normalizeMemoryListResponse(response);
};

export const deleteMyMemory = async (memoryId: string) => {
  return api.delete(`/memories/${memoryId}`);
};

export const getAdminMemories = async (): Promise<MemoryItem[]> => {
  const response = await api.get('/admin/memories');
  return normalizeMemoryListResponse(response);
};

export const approveMemory = async (memoryId: string) => {
  return api.patch(`/admin/memories/${memoryId}/approve`);
};

export const rejectMemory = async (memoryId: string) => {
  return api.patch(`/admin/memories/${memoryId}/reject`);
};

export const deleteMemoryAdmin = async (memoryId: string) => {
  return api.delete(`/admin/memories/${memoryId}`);
};
