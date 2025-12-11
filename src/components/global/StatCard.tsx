import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  index?: number;
}

export const StatCard = ({
  title,
  value,
  change,
  changeType = "positive",
  subtitle,
  icon: Icon,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
  index = 0,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</p>
              {change && (
                <div className="flex items-center gap-1.5 text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      changeType === "positive" && "text-success",
                      changeType === "negative" && "text-destructive",
                      changeType === "neutral" && "text-muted-foreground"
                    )}
                  >
                    {change}
                  </span>
                  <span className="text-muted-foreground text-xs">vs mês anterior</span>
                </div>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                iconBg
              )}
            >
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
