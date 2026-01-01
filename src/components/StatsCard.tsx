import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number | undefined;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBg?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-100",
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/90 backdrop-blur-xl border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                {title}
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                {value}
              </p>
              {trend && (
                <p
                  className={`text-xs sm:text-sm mt-1 sm:mt-2 ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
                  <span className="hidden sm:inline">from last month</span>
                </p>
              )}
            </div>
            <div
              className={`${iconBg} p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl flex-shrink-0`}
            >
              <Icon
                className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${iconColor}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
