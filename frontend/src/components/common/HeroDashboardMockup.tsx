import React from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, CreditCard, Users, CheckCircle2, MoreHorizontal, Filter } from 'lucide-react';

const mockChartData = [
  { name: 'Apr', participants: 420 },
  { name: 'May', participants: 780 },
  { name: 'Jun', participants: 1240 },
  { name: 'Jul', participants: 2890 },
  { name: 'Aug', participants: 4281 },
];

export const HeroDashboardMockup: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full h-full bg-surface-light dark:bg-[#151515] rounded-[16px] border border-border-light dark:border-border-dark shadow-elevation overflow-hidden flex flex-col font-sans select-none pointer-events-none"
    >
      
      {/* Top Navbar */}
      <div className="h-12 border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 bg-background-light dark:bg-[#111111]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-[4px] bg-text-primary dark:bg-white flex items-center justify-center">
              <span className="text-[10px] font-bold text-white dark:text-black">N</span>
            </div>
            <span className="text-[13px] font-semibold tracking-tight dark:text-white">NAWATIX</span>
          </div>
          <div className="h-4 w-px bg-border-light dark:bg-border-dark mx-2"></div>
          <nav className="flex items-center gap-4 text-[13px] text-text-secondary">
            <span className="text-text-primary dark:text-white font-medium">Overview</span>
            <span>Events</span>
            <span>Participants</span>
            <span>Finance</span>
            <span>Check-in</span>
          </nav>
        </div>
        <div className="w-7 h-7 rounded-full bg-surface-hoverLight dark:bg-surface-hoverDark border border-border-light dark:border-border-dark"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold dark:text-white">EVENT OVERVIEW</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[13px] text-text-secondary">Madiun City Run 2026</p>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-emerald/10 text-accent-emerald">Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-md border border-border-light dark:border-border-dark text-[12px] font-medium flex items-center gap-1.5 text-text-primary dark:text-text-darkPrimary">
              <Filter className="w-3.5 h-3.5" />
              This Week
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="p-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-[#111111]">
            <div className="flex items-center gap-2 text-text-secondary text-[12px] font-medium mb-2">
              <Users className="w-4 h-4" /> Participants
            </div>
            <div className="text-[24px] font-semibold dark:text-white">4,281</div>
            <div className="text-[11px] text-accent-emerald mt-1 font-medium">Capacity: 4,500</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="p-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-[#111111]">
            <div className="flex items-center gap-2 text-text-secondary text-[12px] font-medium mb-2">
              <CreditCard className="w-4 h-4" /> Revenue
            </div>
            <div className="text-[24px] font-semibold dark:text-white">Rp824,5M</div>
            <div className="text-[11px] text-accent-emerald mt-1 font-medium">+14% this month</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="p-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-[#111111]">
            <div className="flex items-center gap-2 text-text-secondary text-[12px] font-medium mb-2">
              <Activity className="w-4 h-4" /> Registration
            </div>
            <div className="text-[24px] font-semibold dark:text-white">87%</div>
            <div className="text-[11px] text-text-muted mt-1 font-medium">Active progress</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="p-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-[#111111]">
            <div className="flex items-center gap-2 text-text-secondary text-[12px] font-medium mb-2">
              <CheckCircle2 className="w-4 h-4" /> Check-in
            </div>
            <div className="text-[24px] font-semibold dark:text-white">3,942</div>
            <div className="text-[11px] text-text-muted mt-1 font-medium">87.6% rate</div>
          </motion.div>
        </div>

        {/* Chart & Activity */}
        <div className="grid grid-cols-3 gap-6 h-[240px]">
          <div className="col-span-2 p-5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-[#111111] flex flex-col">
            <h3 className="text-[13px] font-semibold mb-4 dark:text-white">Participant Growth</h3>
            <div className="flex-1 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8A8A86' }} dy={10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E5E2', fontSize: '12px', padding: '4px 8px' }} />
                  <Area isAnimationActive={true} animationDuration={1200} type="monotone" dataKey="participants" stroke="#FF6B00" strokeWidth={2} fillOpacity={1} fill="url(#colorParticipants)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-span-1 p-5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-[#111111] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold dark:text-white">Recent Activity</h3>
              <MoreHorizontal className="w-4 h-4 text-text-muted" />
            </div>
            <div className="space-y-4 flex-1 overflow-hidden">
              {[
                { name: 'REG-48217', action: 'verified', event: 'BIB A4217', time: '08:39' },
                { name: 'REG-48204', action: 'completed', event: 'Registration', time: '08:35' },
                { name: 'TXN-8F42K', action: 'received', event: 'Payment', time: '08:31' },
                { name: 'REG-48196', action: 'completed', event: 'Registration', time: '08:27' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-surface-hoverLight dark:bg-surface-hoverDark flex items-center justify-center shrink-0 border border-border-light dark:border-border-dark">
                    <span className="text-[9px] font-semibold text-text-secondary">{activity.name.charAt(4)}</span>
                  </div>
                  <div>
                    <p className="text-[12px] leading-tight dark:text-text-darkPrimary">
                      <span className="font-semibold">{activity.name}</span> <span className="text-text-secondary">{activity.action}</span> <span className="font-medium">{activity.event}</span>
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
