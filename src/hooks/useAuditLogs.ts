import { useState, useEffect } from "react";
import type { AuditOverview } from "@/types/auditLog";
import {
  useGetAuditOverviewQuery,
  useGetAuditQuery,
} from "@/redux/api/auditApi";

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditStats, setAuditStats] = useState<AuditOverview | null>(null);

  const { data: auditList, isFetching: auditFetching } = useGetAuditQuery({});
  const { data: auditOverView, isFetching: overviewFetching } =
    useGetAuditOverviewQuery();

  useEffect(() => {
    if (auditList && auditOverView) {
      setAuditLogs(auditList?.data);
      setAuditStats(auditOverView.data);
    }
  }, [auditList, auditOverView]);

  return {
    auditLogs,
    auditStats,
    overviewFetching,
    auditFetching,
  };
}
