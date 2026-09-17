import { NextResponse } from 'next/server';

export async function GET() {
  // Local fallback stats
  return NextResponse.json({
    totalUsers: '2.5K+',
    totalProjects: '1.2K+',
    totalTasks: '15K+',
    completedTasks: '12K+',
    completionRate: '85%',
    recentSignups: 47,
    timeSavedHours: '3.2K+',
    testimonials: [
      {
        id: '1',
        name: 'Alex Chen',
        role: 'Product Manager',
        company: 'TechCorp',
        content: 'TaskMate has revolutionized our team\'s productivity. We\'ve completed 40% more tasks since switching.',
        avatar: '👩‍💼',
        rating: 5,
        date: new Date().toISOString(),
        verified: true
      },
      {
        id: '2',
        name: 'Jordan Rivera',
        role: 'Freelance Designer',
        company: 'Creative Studio',
        content: 'The time tracking feature is incredibly accurate. I\'ve increased my billable hours by 25%.',
        avatar: '👨‍🎨',
        rating: 5,
        date: new Date().toISOString(),
        verified: true
      },
      {
        id: '3',
        name: 'Sam Johnson',
        role: 'Engineering Lead',
        company: 'StartupXYZ',
        content: 'Best project management tool we\'ve used. The analytics give us insights we never had before.',
        avatar: '👩‍💻',
        rating: 5,
        date: new Date().toISOString(),
        verified: true
      }
    ],
    lastUpdated: new Date().toISOString(),
    avgTasksPerUser: 6,
    avgProjectsPerUser: 2,
    userGrowthRate: 15,
    totalTimeTracked: '3,200 hours',
    coffeeCupsEquivalent: 1600,
  });
}