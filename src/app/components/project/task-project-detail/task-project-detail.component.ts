import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { TaskStatus, TaskPriority } from '../models/enums/enums';
import { ProjectDetailResponse } from '../models/ProjectDetailResponse';

@Component({
  selector: 'app-task-project-detail',
  templateUrl: './task-project-detail.component.html',
  styleUrls: ['./task-project-detail.component.css']
})
export class TaskProjectDetailComponent implements OnInit, OnChanges {
  @Input() tasks: ProjectDetailResponse['tasks'] = [];
  statusChartOption: EChartsOption = {};
  completionChartOption: EChartsOption = {};
  priorityChartOption: EChartsOption = {};

  ngOnInit(): void {
    this.updateCharts();
  }

  private updateCharts() {
    if (!this.tasks?.length) return;
    this.updateStatusChart();
    this.updateCompletionChart();
    this.updatePriorityChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateCharts();
  }

  private updateStatusChart() {
    if (!this.tasks?.length) return;

    const distribution = {
      [TaskStatus.Todo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.UnderReview]: 0,
      [TaskStatus.Completed]: 0
    };

    this.tasks.forEach(task => {
      distribution[task.status]++;
    });

    const data = Object.entries(distribution).map(([status, count]) => ({
      name: TaskStatus[parseInt(status)],
      value: count
    }));

    this.statusChartOption = {
      title: {
        text: 'Tasks Distribution by Status',
        left: 'center',
        top: 0,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#111827'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const percent = ((params.value / this.tasks.length) * 100).toFixed(1);
          return `${params.name}<br/>${params.value} tasks (${percent}%)`;
        }
      },
      legend: {
        bottom: '5%',
        left: 'center'
      },
      series: [
        {
          name: 'Task Status',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data,
          color: ['#94a3b8', '#60a5fa', '#fbbf24', '#4ade80']
        }
      ]
    };
  }

  private updateCompletionChart() {
    const completedTasks = this.tasks.filter(task => task.status === TaskStatus.Completed).length;
    const totalTasks = this.tasks.length;
    const completionRate = (completedTasks / totalTasks) * 100;
  
    this.completionChartOption = {
      title: {
        text: 'Tasks Completion Rate',
        left: 'center',
        top: 0, 
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#111827'
        }
      },
      legend: {
        bottom: '5%',
        left: 'center'
      },
      series: [
        {
          type: 'gauge',
          radius: '80%',
          center: ['50%', '66%'],
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          progress: {
            show: true,
            width: 18,
            itemStyle: {
              color: '#60a5fa'
            }
          },
          pointer: {
            show: true,
            length: '60%',
            width: 8
          },
          axisLine: {
            lineStyle: {
              width: 18,
              color: [
                [1, '#E6EBF8']
              ]
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: true,
            distance: -18,
            length: 18,
            lineStyle: {
              color: '#999',
              width: 2
            }
          },
          axisLabel: {
            distance: -30,
            color: '#999',
            fontSize: 14
          },
          anchor: {
            show: false
          },
          title: {
            show: false
          },
          detail: {
            valueAnimation: true,
            width: '60%',
            lineHeight: 40,
            borderRadius: 8,
            offsetCenter: [0, '30%'],
            fontSize: 30,
            fontWeight: 'bolder',
            formatter: `${completionRate.toFixed(0)}%`,
            color: '#111827'
          },
          data: [
            {
              value: completionRate
            }
          ]
        }
      ]
    };
  }

  private updatePriorityChart() {
    if (!this.tasks?.length) return;

    const distribution = {
      [TaskPriority.Low]: 0,
      [TaskPriority.Medium]: 0,
      [TaskPriority.High]: 0,
      [TaskPriority.Urgent]: 0
    };

    this.tasks.forEach(task => {
      distribution[task.priority]++;
    });

    const data = Object.entries(distribution).map(([priority, count]) => ({
      name: TaskPriority[parseInt(priority)],
      value: count
    }));

    this.priorityChartOption = {
      title: {
        text: 'Tasks by Priority',
        left: 'center',
        top: 0,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#111827'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const percent = ((params[0].value / this.tasks.length) * 100).toFixed(1);
          return `${params[0].name}<br/>${params[0].value} tasks (${percent}%)`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e5e7eb',
        textStyle: {
          color: '#111827'
        },
        borderWidth: 1,
        padding: [8, 12]
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: Object.keys(distribution).map(priority => TaskPriority[parseInt(priority)]),
        axisTick: {
          alignWithLabel: true,
          length: 8,
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisLabel: {
          interval: 0,
          fontSize: 12,
          color: '#4b5563',
          fontWeight: 'bold'
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#4b5563',
          formatter: '{value}'
        }
      },
      series: [
        {
          name: 'Priority',
          type: 'bar',
          barWidth: '40%',
          barGap: '30%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#4b5563'
          },
          data: data.map(item => ({
            value: item.value,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: this.getGradientStartColor(item.name)
                }, {
                  offset: 1,
                  color: this.getPriorityColor(item.name)
                }]
              },
              borderRadius: [4, 4, 0, 0],
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          })),
          emphasis: {
            itemStyle: {
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 20
            }
          },
          animation: true,
          animationDuration: 1500,
          animationEasing: 'elasticOut'
        }
      ]
    };
  }

  private getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'Low': '#94a3b8',
      'Medium': '#60a5fa',
      'High': '#fb923c',
      'Urgent': '#f87171'
    };
    return colors[priority as keyof typeof colors] || '#94a3b8';
  }

  private getGradientStartColor(priority: string): string {
    const colors: Record<string, string> = {
      'Low': '#cbd5e1',
      'Medium': '#93c5fd',
      'High': '#fdba74',
      'Urgent': '#fca5a5'
    };
    return colors[priority as keyof typeof colors] || '#cbd5e1';
  }
}