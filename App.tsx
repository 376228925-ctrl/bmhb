
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Clock, 
  Timer,
  Info,
  ChevronRight,
  ClipboardList,
  Flame,
  Zap,
  TrendingUp,
  Search,
  FileText,
  UserCheck,
  Network,
  ArrowDownCircle
} from 'lucide-react';
import { 
  FULL_TEAM_MEMBERS as TEAM_MEMBERS, 
  TOP_STRESSED_MEMBERS,
  DEPARTMENT_COMPARISON, 
  AI_EFFICIENCY_STORY 
} from './constants';
import { Priority } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'role' | 'project' | 'ai' | 'backlog'>('overview');

  const stats = useMemo(() => {
    const totalMembers = TEAM_MEMBERS.length;
    const avgWorkload = TEAM_MEMBERS.reduce((s, m) => s + m.totalWorkload, 0) / (totalMembers || 1);
    const totalBacklogCount = TEAM_MEMBERS.flatMap(m => m.backlogTasks).length;
    return { totalMembers, avgWorkload, totalBacklogCount };
  }, []);

  const projectSummaries = useMemo(() => {
    const projects: Record<string, any> = {};
    TEAM_MEMBERS.forEach(m => {
      [...m.tasks, ...m.backlogTasks].forEach(t => {
        if (!projects[t.project]) {
          projects[t.project] = { name: t.project, totalFTE: 0, ongoing: 0, backlog: 0, roleMetrics: {} };
        }
        if (t.status === '进行中') {
          projects[t.project].totalFTE += t.allocation;
          projects[t.project].ongoing += 1;
        } else {
          projects[t.project].backlog += 1;
        }

        // 记录岗位维度
        if (!projects[t.project].roleMetrics[m.role]) {
          projects[t.project].roleMetrics[m.role] = { name: m.role, people: new Map(), hasBacklog: false };
        }
        const roleData = projects[t.project].roleMetrics[m.role];
        if (t.status === '待开始') roleData.hasBacklog = true;
        
        if (!roleData.people.has(m.name)) {
          roleData.people.set(m.name, { name: m.name, ongoing: 0, backlog: 0 });
        }
        const personData = roleData.people.get(m.name);
        if (t.status === '进行中') personData.ongoing++;
        else personData.backlog++;
      });
    });
    return Object.values(projects).sort((a, b) => b.backlog - a.backlog || b.totalFTE - a.totalFTE);
  }, []);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-red-50 border-l-[12px] border-red-600 p-10 rounded-r-[3rem] shadow-2xl">
        <div className="flex items-start">
          <div className="bg-red-600 p-4 rounded-3xl mr-8 mt-1 shadow-lg shrink-0">
            <AlertTriangle className="text-white" size={40} />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-black text-red-950 tracking-tighter mb-4">核心汇报：全员进入“生理承载红区” (EXTREME RISK)</h2>
            <div className="space-y-4 text-red-900">
              <p className="text-xl font-bold leading-relaxed">
                本部门日人均工时 <strong>12.8h</strong>，稳居全中心第一。核心骨干（魏文南、郭昊、谭闯等）实际并发负荷均已接近 <strong>300%</strong>。
              </p>
              <div className="p-6 bg-white/60 rounded-3xl border border-red-200">
                <h4 className="font-black mb-2 flex items-center text-red-950 underline decoration-red-600/30 decoration-4">核心观点摘要：</h4>
                <p className="text-base font-bold leading-relaxed opacity-95">
                  1. <strong>人力弹性丧失</strong>：任何一个单点生病/离职都将导致 P0 战略项目停摆。<br/>
                  2. <strong>AI 效率已透支</strong>：当前 192% 的产能是通过 AI 工具化达到的极限，无法抵消 <strong>5.0 FTE 的刚性缺口</strong>。<br/>
                  3. <strong>积压风险爆发</strong>：当前 <strong>{stats.totalBacklogCount} 项</strong> 积压需求多集中在“产品”与“数据”岗位，属于管理决策的“喉咙”部位。
                </p>
              </div>
            </div>
          </div>
          <button className="hidden lg:flex items-center bg-red-950 text-white px-8 py-5 rounded-2xl font-black hover:bg-black transition-all shadow-xl ml-6 shrink-0">
            导出 PPT <ChevronRight className="ml-2" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '核心参与人数', val: `${stats.totalMembers} 人`, icon: Users, color: 'text-blue-600' },
          { label: '平均工时/日', val: `12.8 H`, icon: Clock, color: 'text-orange-600' },
          { label: '人均负荷率', val: `${stats.avgWorkload.toFixed(0)}%`, icon: BarChart3, color: 'text-indigo-600' },
          { label: '积压需求项', val: `${stats.totalBacklogCount} 项`, icon: ClipboardList, color: 'text-purple-600' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center group transition-all">
            <div className="bg-slate-50 p-4 rounded-2xl mr-6 group-hover:scale-110 transition-transform">
              <item.icon className={item.color} size={32} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{item.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRoleView = () => (
    <div className="space-y-10 animate-in slide-in-from-bottom duration-500 pb-20">
      <div className="flex justify-between items-end border-b-2 border-slate-100 pb-6">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">压力 Top 10：极致负荷骨干画像</h3>
          <p className="text-sm text-slate-500 font-bold mt-2">排名逻辑：并发进行中任务数量权重 + 积压需求数权重</p>
        </div>
        <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100 flex items-center">
           <UserCheck className="text-red-600 mr-3" />
           <span className="text-sm font-black text-red-950 italic">“这些人的崩溃即是项目的崩溃”</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {TOP_STRESSED_MEMBERS.map((m, idx) => (
          <div key={m.id} className="bg-white rounded-[2.5rem] border-2 border-slate-50 p-8 shadow-xl relative group hover:border-red-400 transition-all">
            <div className="absolute top-6 right-8 text-4xl font-black text-slate-100 group-hover:text-red-50 transition-colors">#{idx + 1}</div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-slate-950">{m.name}</h4>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1 bg-slate-50 inline-block px-2 py-0.5 rounded-md">{m.role}</p>
              
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-2xl">
                  <span className="text-[10px] font-black text-indigo-400 uppercase">进行中</span>
                  <span className="text-lg font-black text-indigo-700">{m.tasks.length} 项</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-2xl">
                  <span className="text-[10px] font-black text-red-400 uppercase">积压中</span>
                  <span className="text-lg font-black text-red-700">{m.backlogTasks.length} 项</span>
                </div>

                <div className="pt-4 space-y-2">
                  <p className="text-[9px] text-slate-400 font-black uppercase">主要并行项目：</p>
                  {m.tasks.slice(0, 3).map((t, i) => (
                    <div key={i} className="text-[11px] font-bold text-slate-600 truncate bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      {t.project}
                    </div>
                  ))}
                </div>

                <div className={`mt-4 px-4 py-3 rounded-2xl text-center text-xs font-black ${m.totalWorkload >= 100 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
                  瞬时负荷: {m.totalWorkload}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjectView = () => (
    <div className="space-y-10 animate-in slide-in-from-right duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">项目资源下钻：谁在承载积压？</h3>
          <p className="text-sm text-slate-500 font-bold mt-2">点击查看：项目 -> 缺口岗位 -> 压力责任人</p>
        </div>
        <Network className="text-slate-200" size={64} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {projectSummaries.map((p, idx) => (
          <div key={idx} className={`bg-white rounded-[3rem] border shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl ${p.backlog > 0 ? 'border-amber-200' : 'border-slate-100'}`}>
            <div className={`p-8 ${p.backlog > 0 ? 'bg-amber-50/70' : 'bg-slate-50/70'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-black text-slate-950 text-2xl tracking-tight">{p.name}</h4>
                  <div className="flex space-x-4 mt-3">
                    <div className="flex items-center text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                      正在进行: {p.ongoing}
                    </div>
                    {p.backlog > 0 && (
                      <div className="flex items-center text-xs font-black text-red-600 bg-red-100 px-3 py-1.5 rounded-full border border-red-200">
                        积压需求: {p.backlog}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg">
                  {(p.totalFTE/100).toFixed(2)} FTE
                </div>
              </div>
            </div>
            
            <div className="p-8 flex-1 space-y-6">
              {Object.values(p.roleMetrics).map((role: any, i: number) => (
                <div key={i} className="group">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${role.hasBacklog ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {role.name[0]}
                    </div>
                    <span className="font-black text-slate-800 text-sm tracking-tight">{role.name}</span>
                    <div className="flex-1 h-0.5 bg-slate-50 group-hover:bg-slate-100 transition-colors"></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-12">
                    {Array.from(role.people.values()).map((person: any) => (
                      <div key={person.name} className={`p-3 rounded-2xl border text-center transition-all ${person.backlog > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                         <div className="text-[12px] font-black text-slate-900">{person.name}</div>
                         <div className="flex justify-center space-x-2 mt-1.5 opacity-70">
                            <span className="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border">行:{person.ongoing}</span>
                            {person.backlog > 0 && <span className="text-[9px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">压:{person.backlog}</span>}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBacklog = () => {
    const allBacklogs = TEAM_MEMBERS.flatMap(m => m.backlogTasks.map(t => ({ ...t, owner: m.name }))).sort((a,b) => {
      if (a.priority === Priority.High) return -1;
      return 1;
    });

    return (
      <div className="space-y-10 animate-in zoom-in-95 duration-500 pb-20">
        <div className="bg-red-50 border-l-[12px] border-red-600 p-12 rounded-[3rem] shadow-2xl">
          <h3 className="text-red-950 font-black text-3xl mb-4 flex items-center tracking-tighter">
            积压告警：挂起项目列表 ({allBacklogs.length} 项)
          </h3>
          <p className="text-red-800 text-base font-bold leading-relaxed opacity-90 max-w-4xl">
            标注为红色火焰的属于 <strong>P0 核心需求</strong>。目前因人力物理极限，这些需求处于“已挂起”状态。
          </p>
        </div>
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">
              <tr>
                <th className="px-10 py-8">积压事项</th>
                <th className="px-10 py-8">所属项目</th>
                <th className="px-10 py-8">负责人</th>
                <th className="px-10 py-8 text-right">风险系数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allBacklogs.map((item, idx) => (
                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${item.priority === Priority.High ? 'bg-red-50/10' : ''}`}>
                  <td className="px-10 py-8 font-black text-lg text-slate-900">
                    <div className="flex items-center">
                      {item.priority === Priority.High && <Flame size={20} className="mr-3 text-red-600 animate-pulse shrink-0" />}
                      {item.name}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-slate-500 text-[11px] font-black uppercase tracking-widest">{item.project}</td>
                  <td className="px-10 py-8 text-slate-900 text-base font-black">{item.owner}</td>
                  <td className="px-10 py-8 text-right font-black text-red-600">CRITICAL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAIEfficiency = () => (
    <div className="space-y-10 animate-in zoom-in-95 duration-500">
      <div className="bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 relative z-10">
          <div className="flex-1">
            <Zap className="text-indigo-500 mb-8" size={64} />
            <h2 className="text-4xl font-black mb-6 tracking-tighter text-white">AI 效率：我们在极致压榨下生存</h2>
            <p className="text-slate-400 max-w-2xl leading-relaxed text-lg font-medium opacity-90">
              数据部门已实现 100% AI 工具链覆盖。单人吞吐量已从基期的 0.55 提升至 1.61，
              这是我们在极致负荷下能够维持 200+ 任务并行的唯一技术支柱。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full lg:w-auto">
            {AI_EFFICIENCY_STORY.results.map((r, i) => (
              <div key={i} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md">
                <p className="text-indigo-400 text-[10px] font-black uppercase mb-4 tracking-[0.4em]">{r.label}</p>
                <div className="flex items-end space-x-4">
                  <span className="text-5xl font-black text-white">{r.post}</span>
                  <span className="text-emerald-400 text-sm font-black pb-2 flex items-center bg-emerald-900/40 px-3 py-1 rounded-full">
                    +{r.improve}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/40">
      <header className="bg-white border-b-2 border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-10 h-24 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="bg-slate-950 p-4 rounded-2xl shadow-xl">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950 leading-none tracking-tighter">数据部门人力矩阵看板</h1>
              <p className="text-[10px] text-red-600 font-black tracking-[0.4em] mt-2 uppercase">
                 极限压力监测报告
              </p>
            </div>
          </div>
          <nav className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {[
              { id: 'overview', label: '部门现状汇报' },
              { id: 'role', label: '从岗位看' },
              { id: 'project', label: '从项目投入看' },
              { id: 'backlog', label: '从积压需求看' },
              { id: 'ai', label: 'AI提效视角' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl text-[13px] font-black transition-all ${
                  activeTab === tab.id ? 'bg-white text-slate-950 shadow-md scale-105' : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-10 py-10">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'role' && renderRoleView()}
        {activeTab === 'project' && renderProjectView()}
        {activeTab === 'backlog' && renderBacklog()}
        {activeTab === 'ai' && renderAIEfficiency()}
      </main>
    </div>
  );
};

export default App;
