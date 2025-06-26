import { Sample } from '@/types';

const samplesData: Sample[] = [
  {
    id: '1',
    factoryId: '1',
    factoryName: 'Khader Leathers',
    status: 'in_review',
    createdAt: '2023-11-15T10:30:00',
    techPack: 'https://example.com/techpack1.pdf',
    sketch: 'https://example.com/sketch1.jpg',
    notes: 'Looking for soft finish with minimal visible grain. Sample should include hardware as specified in tech pack.',
    preferredMoq: 50,
  },
  {
    id: '2',
    factoryId: '2',
    factoryName: 'Arora Fine Leathers',
    status: 'shipped',
    createdAt: '2023-11-10T14:45:00',
    techPack: 'https://example.com/techpack2.pdf',
    notes: 'Need embossed pattern as shown in reference images. Please include multiple color variations.',
    preferredMoq: 75,
  },
  {
    id: '3',
    factoryId: '3',
    factoryName: 'Mehta Leather Works',
    status: 'requested',
    createdAt: '2023-11-20T09:15:00',
    techPack: 'https://example.com/techpack3.pdf',
    sketch: 'https://example.com/sketch3.jpg',
    notes: 'Interested in veg-tanned options for this minimal wallet design. Please provide thickness options.',
    preferredMoq: 30,
  },
  {
    id: '4',
    factoryId: '1',
    factoryName: 'Khader Leathers',
    status: 'approved',
    createdAt: '2023-10-25T11:20:00',
    techPack: 'https://example.com/techpack4.pdf',
    preferredMoq: 100,
  },
];

export default samplesData;