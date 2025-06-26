import { fetchGalleryImages, fetchFactoryImage, fetchFactoryVideo } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

const listMock = jest.fn();
const createSignedUrlMock = jest.fn();
const getPublicUrlMock = jest.fn();
const fromMock = jest.fn(() => ({
  list: (...args: any[]) => (global as any).listMock(...args),
  getPublicUrl: (...args: any[]) => (global as any).getPublicUrlMock(...args),
  createSignedUrl: (...args: any[]) => (global as any).createSignedUrlMock(...args),
}));
(global as any).fromMock = fromMock;
(global as any).listMock = listMock;
(global as any).createSignedUrlMock = createSignedUrlMock;
(global as any).getPublicUrlMock = getPublicUrlMock;

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: (...args: any[]) => (global as any).fromMock(...args),
    },
  },
}));

describe('fetchGalleryImages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an empty array when the folder is missing (404)', async () => {
    listMock.mockResolvedValueOnce({ data: null, error: { statusCode: 404 } });

    const result = await fetchGalleryImages('missing');

    expect(fromMock).toHaveBeenCalledWith('images');
    expect(listMock).toHaveBeenCalledWith('missing');
    expect(result).toEqual([]);
  });

  it('returns empty array on non-404 errors', async () => {
    const err = { statusCode: 500 } as any;
    listMock.mockResolvedValueOnce({ data: null, error: err });

    const result = await fetchGalleryImages('factory');
    expect(result).toEqual([]);
  });

  it('returns signed URLs for files', async () => {
    listMock.mockResolvedValueOnce({
      data: [{ name: 'one.png' }, { name: 'two.png' }],
      error: null,
    });
    createSignedUrlMock
      .mockResolvedValueOnce({ data: { signedUrl: 'url1' }, error: null })
      .mockResolvedValueOnce({ data: { signedUrl: 'url2' }, error: null });

    const result = await fetchGalleryImages('factory');

    expect(fromMock).toHaveBeenCalledWith('images');
    expect(createSignedUrlMock).toHaveBeenNthCalledWith(
      1,
      'factory/one.png',
      60 * 60,
    );
    expect(createSignedUrlMock).toHaveBeenNthCalledWith(
      2,
      'factory/two.png',
      60 * 60,
    );
    expect(result).toEqual(['url1', 'url2']);
  });
});

describe('fetchFactoryImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no matching file is found', async () => {
    listMock.mockResolvedValueOnce({ data: [{ name: 'Other.png' }], error: null });

    const result = await fetchFactoryImage('Factory');

    expect(fromMock).toHaveBeenCalledWith('images');
    expect(listMock).toHaveBeenCalledWith('factories');
    expect(result).toBeNull();
  });

  it('returns signed URL when file exists', async () => {
    listMock.mockResolvedValueOnce({ data: [{ name: 'Factory.png' }], error: null });
    createSignedUrlMock.mockResolvedValueOnce({ data: { signedUrl: 'url' }, error: null });

    const result = await fetchFactoryImage('Factory');

    expect(fromMock).toHaveBeenCalledWith('images');
    expect(createSignedUrlMock).toHaveBeenCalledWith('factories/Factory.png', 60 * 60);
    expect(result).toBe('url');
  });
});

describe('fetchFactoryVideo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no matching file is found', async () => {
    listMock.mockResolvedValueOnce({ data: [{ name: 'Other.mp4' }], error: null });

    const result = await fetchFactoryVideo('Factory');

    expect(fromMock).toHaveBeenCalledWith('videos');
    expect(listMock).toHaveBeenCalledWith('videos');
    expect(result).toBeNull();
  });

  it('returns signed URL when file exists', async () => {
    listMock.mockResolvedValueOnce({ data: [{ name: 'Factory.mp4' }], error: null });
    createSignedUrlMock.mockResolvedValueOnce({ data: { signedUrl: 'url' }, error: null });

    const result = await fetchFactoryVideo('Factory');

    expect(fromMock).toHaveBeenCalledWith('videos');
    expect(createSignedUrlMock).toHaveBeenCalledWith('videos/Factory.mp4', 60 * 60);
    expect(result).toBe('url');
  });
});
