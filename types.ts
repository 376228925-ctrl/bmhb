
export enum Priority {
  High = '高',
  Medium = '中',
  Low = '低'
}

export type TaskStatus = '进行中' | '待开始' | '已完成' | '持持续' | '已挂起';

export interface Task {
  id: string;
  name: string;
  project: string; // The specific project name
  module: string;  // The module or category
  allocation: number; // 0-100
  priority: Priority;
  startTime: string;
  endTime: string;
  status: TaskStatus;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  tasks: Task[];
  backlogTasks: Task[]; // Tasks assigned but not started/overloaded
  totalWorkload: number;
}

export interface ProjectSummary {
  name: string;
  totalFTE: number;
  members: {
    memberName: string;
    role: string;
    taskAllocation: number;
    overallWorkload: number;
  }[];
}

export interface AIEfficiencyMetric {
  category: string;
  metricName: string;
  periodPre: string; // 3-9月
  periodPost: string; // 11-12月
  improvement: string;
}
