import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from './service/analytics.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  Math = Math;
  isLoading = true;
  errorMessage: string | null = null;

  // Data properties
  overviewData: any;
  taskDistribution: any;
  teamPerformance: any;

  // Chart options
  projectProgressOption: EChartsOption = {};
  taskStatusOption: EChartsOption = {};
  taskPriorityOption: EChartsOption = {};
  teamPerformanceOption: EChartsOption = {};

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.loadAnalyticsData();
  }

  loadAnalyticsData() {
    this.isLoading = true;
    forkJoin({
      overview: this.analyticsService.getOverviewAnalytics(),
      taskDistribution: this.analyticsService.getTasksDistribution(),
      teamPerformance: this.analyticsService.getTeamPerformance()
    }).subscribe({
      next: (data) => {
        this.overviewData = data.overview;
        this.taskDistribution = data.taskDistribution;
        this.teamPerformance = data.teamPerformance;
        this.initializeCharts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.errorMessage = 'Failed to load analytics data';
        this.isLoading = false;
      }
    });
  }

  initializeCharts() {
    this.initProjectProgressChart();
    this.initTaskStatusChart();
    this.initTaskPriorityChart();
    this.initTeamPerformanceChart();
  }

  initProjectProgressChart() {
    const progress = Math.round(this.overviewData.projectCompletionRate);
    const arrowColor = progress > 50 ? '#10b981' : '#ef4444';
    
    this.projectProgressOption = {
      series: [{
        type: 'gauge',
        progress: {
          show: true,
          width: 18,
          itemStyle: {
            color: progress > 50 ? '#10b981' : '#ef4444'
          }
        },
        axisLine: {
          lineStyle: {
            width: 18
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          length: 15,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        pointer: {
          show: false
        },
        axisLabel: {
          show: false
        },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '-15%'],
          formatter: function (value: number) {
            const arrow = value > 50 ? '▲' : '▼';
            const color = value > 50 ? '#10b981' : '#ef4444';
            return `{value|${Math.round(value)}%}\n{arrow|${arrow}}`;
          },
          rich: {
            value: {
              fontSize: 28,
              fontWeight: 'bold',
              color: 'auto'
            },
            arrow: {
              fontSize: 20,
              color: arrowColor,
              padding: [5, 0]
            }
          }
        },
        title: {
          show: true,
          offsetCenter: [0, '20%'],
          fontSize: 14,
          color: '#64748b'
        },
        data: [{
          value: progress,
          name: 'Project Progress'
        }]
      }]
    };
}

  initTaskStatusChart() {
    const colors = ['#4e79a7', '#59a14f', '#f28e2c', '#e15759'];

    this.taskStatusOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'horizontal',
        bottom: 'bottom'
      },
      series: [{
        name: 'Task Status',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderWidth: 2
        },
        label: {
          show: false
        },
        color: colors,
        data: this.taskDistribution.tasksByStatus.map((item: any) => ({
          value: item.count,
          name: item.status
        }))
      }]
    };
  }

  initTaskPriorityChart() {
    const colors:any = {
      'Urgent': '#e15759',
      'High': '#ff7c43',
      'Medium': '#f28e2c',
      'Low': '#59a14f'
    };

    this.taskPriorityOption = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.taskDistribution.tasksByPriority.map((item: any) => item.priority),
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: [{
        data: this.taskDistribution.tasksByPriority.map((item: any) => ({
          value: item.count,
          itemStyle: {
            color: colors[item.priority] || '#8884d8'
          }
        })),
        type: 'bar',
        barWidth: '60%',
        label: {
          show: true,
          position: 'top'
        }
      }]
    };
  }

  initTeamPerformanceChart() {
    this.teamPerformanceOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Total Tasks', 'Completed Tasks']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: this.teamPerformance.map((item: any) => item.userName)
      },
      series: [
        {
          name: 'Total Tasks',
          type: 'bar',
          data: this.teamPerformance.map((item: any) => item.totalTasks)
        },
        {
          name: 'Completed Tasks',
          type: 'bar',
          data: this.teamPerformance.map((item: any) => item.completedTasks)
        }
      ]
    };
  }

  refreshData() {
    this.loadAnalyticsData();
  }
}