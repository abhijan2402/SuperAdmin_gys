import { useState, useEffect } from "react";
import type { SupportTicket, TicketStatus, TicketReply } from "@/types/ticket";
import { toast } from "sonner";
import {
  useGetTicketListQuery,
  useGetTicketStatsQuery,
  useReplyToTicketMutation,
  useUpdateStatusMutation,
} from "@/redux/api/ticketListApi";
import { useAuth } from "@/context/AuthContext";

export function useSupport() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const { data: ticketStats } = useGetTicketStatsQuery("");
  const { data, isFetching } = useGetTicketListQuery("");
  const [replyToTicket] = useReplyToTicketMutation();
  const [updateStatus] = useUpdateStatusMutation();

  useEffect(() => {
    setTickets(data?.data);
  }, [data?.data]);

  const updateTicketStatus = async (selectedTicket: any, status: any) => {
    const payload = {
      status,
    };
    await updateStatus({ id: selectedTicket?.id, payload }).unwrap();
    toast.success(`Ticket ${status}`);
  };

  const addReply = async (
    selectedTicket: any,
    message: string,
    attachments: any
  ) => {
    const payload = {
      message,
      sender_name: user?.full_name,
      sender_email: user?.email,
      sender_type: user?.role,
      attachments: attachments,
    };
    console.log(payload);
    await replyToTicket({ id: selectedTicket?.id, payload }).unwrap();
    toast.success("Reply added successfully");
  };

  const getTicketById = (id: string) => {
    return tickets.find((ticket) => ticket.id === id);
  };

  return {
    tickets,
    ticketStats,
    isFetching,
    updateTicketStatus,
    addReply,
    getTicketById,
  };
}
