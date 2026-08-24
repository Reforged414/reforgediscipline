import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface Props {
  /** 24 numbers, index = hour of day */
  counts: number[];
  hasData: boolean;
  emptyText: string;
  peakHour?: number | null;
}

const tickLabel = (h: number) => {
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  return h > 12 ? `${h - 12}p` : `${h}a`;
};

const UrgeHourChart = ({ counts, hasData, emptyText, peakHour }: Props) => {
  const data = counts.map((value, hour) => ({ hour, value, label: tickLabel(hour) }));
  const max = Math.max(1, ...counts);

  return (
    <div className="bg-secondary rounded-2xl p-4 relative">
      <div className={hasData ? '' : 'opacity-25 pointer-events-none select-none'}>
        <div className="h-40 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap={2} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="hour"
                tickFormatter={(h: number) => (h % 3 === 0 ? tickLabel(h) : '')}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                width={26}
                allowDecimals={false}
                domain={[0, max]}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              {hasData && (
                <Tooltip
                  cursor={{ fill: 'hsl(var(--primary) / 0.08)' }}
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelFormatter={(h) => `${tickLabel(Number(h))}`}
                  formatter={(v: number) => [`${v} urge${v === 1 ? '' : 's'}`, '']}
                />
              )}
              <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={hasData}>
                {data.map((d) => (
                  <Cell
                    key={d.hour}
                    fill={
                      peakHour != null && d.hour === peakHour
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--primary) / 0.45)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="text-xs text-muted-foreground italic leading-relaxed">{emptyText}</p>
        </div>
      )}
    </div>
  );
};

export default UrgeHourChart;
