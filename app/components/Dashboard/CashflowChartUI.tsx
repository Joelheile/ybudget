"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../../convex/_generated/api";
import {
  calculateAxisConfig,
  calculateStartBalance,
  formatCurrency,
  generateCashflowData,
  type CashflowDataPoint,
} from "./cashflowChartLogic";

const chartConfig = {
  actualIncome: {
    label: "Tatsächliche Einnahmen",
    color: "#10b981",
  },
  expectedIncome: {
    label: "Erwartete Einnahmen",
    color: "#86efac",
  },
  actualExpenses: {
    label: "Tatsächliche Ausgaben",
    color: "#ef4444",
  },
  expectedExpenses: {
    label: "Erwartete Ausgaben",
    color: "#fb923c",
  },
  balance: {
    label: "Kontostand",
    color: "#4b5563",
  },
} satisfies ChartConfig;

export function CashflowChartUI() {
  const { selectedDateRange } = useDateRange();

  const pastEndDate = new Date(selectedDateRange.from);
  pastEndDate.setDate(pastEndDate.getDate() - 1);
  pastEndDate.setHours(23, 59, 59, 999);

  const allTransactions = useQuery(
    api.transactions.queries.getTransactionsByDateRange,
    {
      startDate: selectedDateRange.from.getTime(),
      endDate: selectedDateRange.to.getTime(),
    },
  );

  const pastTransactions = useQuery(
    api.transactions.queries.getTransactionsByDateRange,
    {
      startDate: new Date(1970, 0, 1).getTime(),
      endDate: pastEndDate.getTime(),
    },
  );

  const startBalance = calculateStartBalance(pastTransactions);

  const dataPoints =
    allTransactions !== undefined
      ? generateCashflowData(
          allTransactions,
          startBalance,
          selectedDateRange.from,
          selectedDateRange.to,
        )
      : [];

  const axisConfig = calculateAxisConfig(
    dataPoints,
    selectedDateRange.from,
    selectedDateRange.to,
  );

  const dateRangeText = `${format(selectedDateRange.from, "d. MMM yyyy", {
    locale: de,
  })} - ${format(selectedDateRange.to, "d. MMM yyyy", { locale: de })}`;

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader>
        <CardTitle>Cashflow Übersicht</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 overflow-hidden">
        {allTransactions === undefined ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Daten werden geladen...
          </div>
        ) : dataPoints.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Keine Transaktionen im ausgewählten Zeitraum
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[40vh] w-full">
            <ComposedChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={axisConfig.xAxisInterval}
                angle={
                  axisConfig.isLongPeriod
                    ? 0
                    : axisConfig.isManyDataPoints
                      ? -45
                      : 0
                }
                textAnchor={
                  axisConfig.isLongPeriod
                    ? "middle"
                    : axisConfig.isManyDataPoints
                      ? "end"
                      : "middle"
                }
                height={
                  axisConfig.isLongPeriod
                    ? 20
                    : axisConfig.isManyDataPoints
                      ? 60
                      : 30
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatCurrency}
                domain={[
                  -axisConfig.roundedMaxBarValue,
                  axisConfig.roundedMaxBarValue,
                ]}
                ticks={axisConfig.yAxisTicks}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="!gap-2.5 px-3 py-2.5 [&>div]:!gap-2.5"
                    labelFormatter={(value, payload) => {
                      if (!payload || payload.length === 0) return value;
                      const dataPoint = payload[0]
                        ?.payload as CashflowDataPoint;
                      if (!dataPoint?.timestamp) return value;
                      const date = new Date(dataPoint.timestamp);
                      const weekday = format(date, "EEEE", { locale: de });
                      const dayMonth = format(date, "d. MMMM", { locale: de });
                      return `${weekday}, ${dayMonth}`;
                    }}
                    labelClassName="font-bold"
                    formatter={(value, name) => {
                      const formattedNumber = new Intl.NumberFormat("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Math.abs(value as number));
                      const formattedValue = `${formattedNumber}€`;

                      const itemConfig =
                        chartConfig[name as keyof typeof chartConfig];

                      return (
                        <div className="flex w-full items-center gap-3">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor:
                                itemConfig?.color || "hsl(0 0% 50%)",
                            }}
                          />
                          <div className="flex flex-1 items-center justify-between gap-4">
                            <span className="text-muted-foreground">
                              {itemConfig?.label || name}
                            </span>
                            <span className="text-foreground font-mono font-medium tabular-nums">
                              {formattedValue}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />
              <ChartLegend
                content={<ChartLegendContent verticalAlign="bottom" />}
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: 8 }}
              />
              <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={2} />
              <Bar
                dataKey="actualIncome"
                stackId="income"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="expectedIncome"
                stackId="income"
                fill="#86efac"
                fillOpacity={0.7}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="actualExpenses"
                stackId="expenses"
                fill="#ef4444"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="expectedExpenses"
                stackId="expenses"
                fill="#fb923c"
                fillOpacity={0.7}
                radius={[0, 0, 4, 4]}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#4b5563"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
