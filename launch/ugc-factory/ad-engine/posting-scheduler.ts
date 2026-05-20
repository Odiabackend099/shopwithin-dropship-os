import * as fs from 'fs';
import * as path from 'path';

interface PostingSchedule {
  platform: 'tiktok' | 'reels' | 'shorts' | 'pinterest';
  frequency: number; // videos per day
  optimalTimes: string[]; // optimal posting times
  hashtags: string[];
}

interface ContentQueue {
  productId: string;
  content: {
    prompt: string;
    hook: string;
    script: string[];
    caption: string;
  };
  platform: string;
  scheduledTime?: Date;
  status: 'pending' | 'scheduled' | 'posted';
}

export class PostingScheduler {
  private basePath: string;
  private contentQueue: ContentQueue[];
  private postingSchedules: Map<string, PostingSchedule>;
  private outputPath: string;

  constructor(basePath: string = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory') {
    this.basePath = basePath;
    this.contentQueue = [];
    this.postingSchedules = new Map();
    this.outputPath = path.join(basePath, 'posting-schedule');
    
    this.initializeSchedules();
  }

  private initializeSchedules(): void {
    // TikTok: 4-6 videos daily at peak times
    this.postingSchedules.set('tiktok', {
      platform: 'tiktok',
      frequency: 5,
      optimalTimes: ['09:00', '12:00', '15:00', '18:00', '21:00'],
      hashtags: ['#fyp', '#viral', '#trending', '#foryou', '#foryoupage']
    });

    // Instagram Reels: 2-3 videos daily
    this.postingSchedules.set('reels', {
      platform: 'reels',
      frequency: 2,
      optimalTimes: ['11:00', '19:00'],
      hashtags: ['#explore', '#reels', '#viral', '#trending']
    });

    // YouTube Shorts: 2-3 videos daily
    this.postingSchedules.set('shorts', {
      platform: 'shorts',
      frequency: 2,
      optimalTimes: ['10:00', '20:00'],
      hashtags: ['#shorts', '#viral', '#trending']
    });

    // Pinterest Idea Pins: 1-2 videos daily
    this.postingSchedules.set('pinterest', {
      platform: 'pinterest',
      frequency: 1,
      optimalTimes: ['14:00'],
      hashtags: ['#viral', '#trending', '#ideas']
    });

    console.log('✅ Initialized posting schedules for all platforms');
  }

  addToQueue(content: ContentQueue): void {
    this.contentQueue.push(content);
    console.log(`✅ Added content to queue: ${content.productId} for ${content.platform}`);
  }

  generateDailySchedule(): Map<string, ContentQueue[]> {
    const dailySchedule = new Map<string, ContentQueue[]>();
    const pendingContent = this.contentQueue.filter(c => c.status === 'pending');

    // Distribute content across platforms based on frequency
    this.postingSchedules.forEach((schedule, platform) => {
      const platformContent = pendingContent
        .filter(c => c.platform === platform || c.platform === 'all')
        .slice(0, schedule.frequency);

      platformContent.forEach((content, index: number) => {
        const timeIndex = index % schedule.optimalTimes.length;
        const scheduledTime = this.calculateScheduledTime(schedule.optimalTimes[timeIndex]);
        content.scheduledTime = scheduledTime;
        content.status = 'scheduled';
      });

      dailySchedule.set(platform, platformContent);
    });

    return dailySchedule;
  }

  private calculateScheduledTime(timeStr: string): Date {
    const timeParts = timeStr.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime < new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return scheduledTime;
  }

  saveSchedule(dailySchedule: Map<string, ContentQueue[]>): void {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const schedulePath = path.join(this.outputPath, `schedule-${timestamp}.json`);

    const scheduleData = {
      generatedAt: new Date().toISOString(),
      platforms: Array.from(dailySchedule.entries()).map(([platform, content]) => ({
        platform,
        content: content.map(c => ({
          productId: c.productId,
          platform: c.platform,
          scheduledTime: c.scheduledTime,
          status: c.status
        }))
      }))
    };

    fs.writeFileSync(schedulePath, JSON.stringify(scheduleData, null, 2));
    console.log(`💾 Saved posting schedule to: ${schedulePath}`);
  }

  getPostingStrategy(): string {
    return `
MASS ORGANIC POSTING STRATEGY
==============================

Daily Posting Volume:
- TikTok: 5 videos (9am, 12pm, 3pm, 6pm, 9pm)
- Instagram Reels: 2 videos (11am, 7pm)
- YouTube Shorts: 2 videos (10am, 8pm)
- Pinterest Idea Pins: 1 video (2pm)

Total Daily: 10 videos across 4 platforms

Weekly Posting Volume:
- TikTok: 35 videos
- Instagram Reels: 14 videos
- YouTube Shorts: 14 videos
- Pinterest: 7 videos

Total Weekly: 70 videos

Posting Strategy:
1. Peak Times: Post during high-engagement hours
2. Content Mix: Rotate between hooks, testimonials, before/after, reactions
3. Product Rotation: Feature different products daily
4. Platform Optimization: Tailor captions and hashtags per platform
5. Consistency: Maintain daily posting schedule without gaps

Content Rotation:
- Day 1: Problem-solution videos
- Day 2: Transformation videos
- Day 3: Testimonial videos
- Day 4: Quick demo videos
- Day 5: Before/after videos
- Day 6: POV videos
- Day 7: Reaction videos

Performance Tracking:
- Monitor watch time, completion rate
- Track engagement (likes, comments, shares)
- Analyze CTR on product links
- Identify winning content patterns
- Scale winning content, pause underperformers
`;
  }

  generateContentCalendar(days: number = 7): void {
    const calendar: any[] = [];
    const startDate = new Date();

    for (let day = 0; day < days; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);

      const daySchedule = {
        date: currentDate.toISOString().split('T')[0],
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        platforms: {} as any
      };

      this.postingSchedules.forEach((schedule, platform) => {
        daySchedule.platforms[platform] = {
          frequency: schedule.frequency,
          times: schedule.optimalTimes.slice(0, schedule.frequency),
          contentType: this.getContentTypeForDay(day)
        };
      });

      calendar.push(daySchedule);
    }

    const calendarPath = path.join(this.outputPath, 'content-calendar.json');
    fs.writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
    console.log(`💾 Saved content calendar to: ${calendarPath}`);
  }

  private getContentTypeForDay(day: number): string {
    const contentTypes = [
      'problem-solution',
      'transformation',
      'testimonial',
      'quick-demo',
      'before-after',
      'pov',
      'reaction'
    ];
    return contentTypes[day % contentTypes.length];
  }

  getQueueStatus(): string {
    const pending = this.contentQueue.filter(c => c.status === 'pending').length;
    const scheduled = this.contentQueue.filter(c => c.status === 'scheduled').length;
    const posted = this.contentQueue.filter(c => c.status === 'posted').length;

    return `
QUEUE STATUS
============
Pending: ${pending}
Scheduled: ${scheduled}
Posted: ${posted}
Total: ${this.contentQueue.length}
`;
  }
}
