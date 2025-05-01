import { UserProfile } from '@/types';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get('lat') || '0');
  const lng = parseFloat(url.searchParams.get('lng') || '0');
  const radius = parseFloat(url.searchParams.get('radius') || '5');

  // TODO: Replace with actual database query
  // This is just mock data for now
  const mockUsers: UserProfile[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      age: 28,
      bio: 'Hiking enthusiast and amateur photographer',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      hobbies: ['Photography', 'Hiking', 'Reading'],
      sports: ['Tennis', 'Running'],
      location: {
        latitude: lat + 0.01,
        longitude: lng - 0.01,
      },
      rating: { average: 4.7, count: 23 },
      lastActive: new Date().toISOString(),
    },
    // Add more mock users as needed
  ];

  return Response.json(mockUsers);
}