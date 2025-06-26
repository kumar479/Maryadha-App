import { supabase } from './supabase';

export const fetchGalleryImages = async (factoryName: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage.from('images').list(factoryName);

    if (error) {
      // Return empty array if the folder doesn't exist
      if (error.statusCode === 404) {
        return [];
      }
      throw error;
    }

    if (!data) {
      return [];
    }

    // Fetch signed URLs for each file (1 hour expiry)
    const signedUrls = await Promise.all(
      data.map(async (file) => {
        const { data: signedData, error: signedError } = await supabase.storage
          .from('images')
          .createSignedUrl(`${factoryName}/${file.name}`, 60 * 60);
        if (signedError || !signedData) {
          console.error('Error creating signed URL:', signedError);
          return null;
        }
        return signedData.signedUrl;
      })
    );

    // Filter out any nulls (failed URLs)
    return signedUrls.filter((url): url is string => !!url);
  } catch (err) {
    console.error('Error fetching gallery images:', err);
    return [];
  }
};

export const fetchFactoryImage = async (
  factoryName: string,
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .list('factories');
    if (error || !data) {
      if (error && error.statusCode === 404) return null;
      return null;
    }

    const file = data.find(
      (item) => item.name.split('.')[0] === factoryName,
    );
    if (!file) return null;

    const { data: signed, error: signedError } = await supabase.storage
      .from('images')
      .createSignedUrl(`factories/${file.name}`, 60 * 60);
    if (signedError || !signed) {
      console.error('Error creating signed URL:', signedError);
      return null;
    }
    return signed.signedUrl;
  } catch (err) {
    console.error('Error fetching factory image:', err);
    return null;
  }
};

export const fetchFactoryVideo = async (
  factoryName: string,
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('videos')
      .list('videos');
    if (error || !data) {
      if (error && error.statusCode === 404) return null;
      return null;
    }

    const file = data.find((item) => item.name.split('.')[0] === factoryName);
    if (!file) return null;

    const { data: signed, error: signedError } = await supabase.storage
      .from('videos')
      .createSignedUrl(`videos/${file.name}`, 60 * 60);
    if (signedError || !signed) {
      console.error('Error creating signed URL:', signedError);
      return null;
    }
    return signed.signedUrl;
  } catch (err) {
    console.error('Error fetching factory video:', err);
    return null;
  }
};
