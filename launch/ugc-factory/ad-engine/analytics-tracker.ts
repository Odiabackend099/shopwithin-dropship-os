import * as fs from 'fs';
import * as path from 'path';

interface VideoMetrics {
  videoId: string;
  productId: string;
  platform: string;
  postedAt: string;
  metrics: {
    views: number;
    watchTime: number; // seconds
    completionRate: number; // percentage
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    ctr: number; // click-through rate percentage
    conversions: number;
    revenue: number;
  };
  status: 'active' | 'paused' | 'winner' | 'loser';
}

interface ProductPerformance {
  productId: string;
  productName: string;
  category: string;
  totalVideos: number;
  totalViews: number;
  totalConversions: number;
  totalRevenue: number;
  averageCTR: number;
  averageCompletionRate: number;
  status: 'testing' | 'winner' | 'loser';
}

export class AnalyticsTracker {
  private basePath: string;
  private outputPath: string;
  private videoMetrics: Map<string, VideoMetrics>;
  private productPerformance: Map<string, ProductPerformance>;

  constructor(basePath: string = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory') {
    this.basePath = basePath;
    this.outputPath = path.join(basePath, 'analytics');
    this.videoMetrics = new Map();
    this.productPerformance = new Map();
    
    this.initializeAnalytics();
  }

  private initializeAnalytics(): void {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
    console.log('✅ Initialized analytics tracking system');
  }

  trackVideo(metrics: VideoMetrics): void {
    this.videoMetrics.set(metrics.videoId, metrics);
    this.updateProductPerformance(metrics);
    console.log(`✅ Tracked metrics for video: ${metrics.videoId}`);
  }

  private updateProductPerformance(videoMetrics: VideoMetrics): void {
    const existing = this.productPerformance.get(videoMetrics.productId);
    
    if (existing) {
      existing.totalVideos += 1;
      existing.totalViews += videoMetrics.metrics.views;
      existing.totalConversions += videoMetrics.metrics.conversions;
      existing.totalRevenue += videoMetrics.metrics.revenue;
      existing.averageCTR = this.calculateAverage(
        existing.averageCTR,
        videoMetrics.metrics.ctr,
        existing.totalVideos
      );
      existing.averageCompletionRate = this.calculateAverage(
        existing.averageCompletionRate,
        videoMetrics.metrics.completionRate,
        existing.totalVideos
      );
    } else {
      this.productPerformance.set(videoMetrics.productId, {
        productId: videoMetrics.productId,
        productName: videoMetrics.productId, // Would be populated from product data
        category: 'unknown', // Would be populated from product data
        totalVideos: 1,
        totalViews: videoMetrics.metrics.views,
        totalConversions: videoMetrics.metrics.conversions,
        totalRevenue: videoMetrics.metrics.revenue,
        averageCTR: videoMetrics.metrics.ctr,
        averageCompletionRate: videoMetrics.metrics.completionRate,
        status: 'testing'
      });
    }
  }

  private calculateAverage(existingAvg: number, newValue: number, count: number): number {
    return ((existingAvg * (count - 1)) + newValue) / count;
  }

  analyzeVideoPerformance(videoId: string): string {
    const metrics = this.videoMetrics.get(videoId);
    if (!metrics) {
      return `No metrics found for video: ${videoId}`;
    }

    const analysis = {
      performance: this.classifyPerformance(metrics),
      recommendations: this.getRecommendations(metrics),
      nextSteps: this.getNextSteps(metrics)
    };

    return `
VIDEO PERFORMANCE ANALYSIS: ${videoId}
====================================

Metrics:
- Views: ${metrics.metrics.views}
- Watch Time: ${metrics.metrics.watchTime}s
- Completion Rate: ${metrics.metrics.completionRate}%
- Likes: ${metrics.metrics.likes}
- Comments: ${metrics.metrics.comments}
- Shares: ${metrics.metrics.shares}
- Saves: ${metrics.metrics.saves}
- CTR: ${metrics.metrics.ctr}%
- Conversions: ${metrics.metrics.conversions}
- Revenue: $${metrics.metrics.revenue}

Performance: ${analysis.performance}
Recommendations: ${analysis.recommendations}
Next Steps: ${analysis.nextSteps}
`;
  }

  private classifyPerformance(metrics: VideoMetrics): string {
    const { views, completionRate, ctr, conversions } = metrics.metrics;
    
    if (views > 10000 && completionRate > 50 && ctr > 3 && conversions > 10) {
      return 'WINNER - Scale aggressively';
    } else if (views > 5000 && completionRate > 40 && ctr > 2 && conversions > 5) {
      return 'STRONG - Continue testing';
    } else if (views > 1000 && completionRate > 30 && ctr > 1) {
      return 'PROMISING - Monitor closely';
    } else {
      return 'WEAK - Pause or pivot';
    }
  }

  private getRecommendations(metrics: VideoMetrics): string {
    const { completionRate, ctr, conversions } = metrics.metrics;
    
    if (completionRate < 30) {
      return 'Improve hook and content retention';
    } else if (ctr < 2) {
      return 'Optimize CTA and product link placement';
    } else if (conversions < 5) {
      return 'Review landing page and offer';
    } else {
      return 'Maintain current strategy';
    }
  }

  private getNextSteps(metrics: VideoMetrics): string {
    const performance = this.classifyPerformance(metrics);
    
    if (performance.includes('WINNER')) {
      return 'Create more variations, increase ad spend, scale to other platforms';
    } else if (performance.includes('STRONG')) {
      return 'Test different hooks, optimize posting times, increase volume';
    } else if (performance.includes('PROMISING')) {
      return 'A/B test elements, refine targeting, monitor for 48 hours';
    } else {
      return 'Pause content, analyze why it failed, try different angle';
    }
  }

  getProductReport(productId: string): string {
    const performance = this.productPerformance.get(productId);
    if (!performance) {
      return `No performance data for product: ${productId}`;
    }

    return `
PRODUCT PERFORMANCE REPORT: ${productId}
======================================

Summary:
- Total Videos: ${performance.totalVideos}
- Total Views: ${performance.totalViews}
- Total Conversions: ${performance.totalConversions}
- Total Revenue: $${performance.totalRevenue}
- Average CTR: ${performance.averageCTR.toFixed(2)}%
- Average Completion Rate: ${performance.averageCompletionRate.toFixed(2)}%
- Status: ${performance.status.toUpperCase()}

Metrics per Video:
- Views per Video: ${(performance.totalViews / performance.totalVideos).toFixed(0)}
- Conversions per Video: (performance.totalConversions / performance.totalVideos).toFixed(1)
- Revenue per Video: $${(performance.totalRevenue / performance.totalVideos).toFixed(2)}
`;
  }

  generateWeeklyReport(): string {
    const totalVideos = this.videoMetrics.size;
    const totalViews = Array.from(this.videoMetrics.values()).reduce((sum, m) => sum + m.metrics.views, 0);
    const totalConversions = Array.from(this.videoMetrics.values()).reduce((sum, m) => sum + m.metrics.conversions, 0);
    const totalRevenue = Array.from(this.videoMetrics.values()).reduce((sum, m) => sum + m.metrics.revenue, 0);
    
    const winners = Array.from(this.videoMetrics.values()).filter(m => m.status === 'winner').length;
    const losers = Array.from(this.videoMetrics.values()).filter(m => m.status === 'loser').length;

    return `
WEEKLY ANALYTICS REPORT
========================

Content Performance:
- Total Videos Posted: ${totalVideos}
- Total Views: ${totalViews}
- Total Conversions: ${totalConversions}
- Total Revenue: $${totalRevenue}
- Winners: ${winners}
- Losers: ${losers}

Averages:
- Views per Video: ${(totalViews / totalVideos || 0).toFixed(0)}
- Conversions per Video: ${(totalConversions / totalVideos || 0).toFixed(1)}
- Revenue per Video: $${(totalRevenue / totalVideos || 0).toFixed(2)}

Product Performance:
${Array.from(this.productPerformance.values()).map(p => 
  `- ${p.productName}: ${p.totalViews} views, $${p.totalRevenue} revenue (${p.status})`
).join('\n')}

Recommendations:
${this.generateRecommendations()}
`;
  }

  private generateRecommendations(): string {
    const winners = Array.from(this.productPerformance.values()).filter(p => p.status === 'winner');
    const losers = Array.from(this.productPerformance.values()).filter(p => p.status === 'loser');
    const testing = Array.from(this.productPerformance.values()).filter(p => p.status === 'testing');

    let recommendations = [];

    if (winners.length > 0) {
      recommendations.push(`• Scale winners: ${winners.map(w => w.productName).join(', ')}`);
    }

    if (losers.length > 0) {
      recommendations.push(`• Kill losers: ${losers.map(l => l.productName).join(', ')}`);
    }

    if (testing.length > 0) {
      recommendations.push(`• Continue testing: ${testing.map(t => t.productName).join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('• Need more data to make recommendations');
    }

    return recommendations.join('\n');
  }

  saveAnalytics(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save video metrics
    const videoMetricsPath = path.join(this.outputPath, `video-metrics-${timestamp}.json`);
    const videoMetricsData = Array.from(this.videoMetrics.values());
    fs.writeFileSync(videoMetricsPath, JSON.stringify(videoMetricsData, null, 2));

    // Save product performance
    const productPerformancePath = path.join(this.outputPath, `product-performance-${timestamp}.json`);
    const productPerformanceData = Array.from(this.productPerformance.values());
    fs.writeFileSync(productPerformancePath, JSON.stringify(productPerformanceData, null, 2));

    console.log(`💾 Saved analytics to: ${this.outputPath}`);
  }

  getTopPerformingVideos(limit: number = 5): VideoMetrics[] {
    return Array.from(this.videoMetrics.values())
      .sort((a, b) => b.metrics.views - a.metrics.views)
      .slice(0, limit);
  }

  getTopPerformingProducts(limit: number = 5): ProductPerformance[] {
    return Array.from(this.productPerformance.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }
}
