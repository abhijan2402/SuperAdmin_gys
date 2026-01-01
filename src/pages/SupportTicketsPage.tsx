import { useState, useEffect } from "react";
import { useSupport } from "@/hooks/useSupport";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StatsCard from "@/components/StatsCard";
import StatusBadge from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MessageSquare,
  Send,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Tag,
  Paperclip,
  X,
  FileText,
  Plus,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { SupportTicket } from "@/types/ticket";

export default function SupportTicketsPage() {
  const { tickets, isFetching, updateTicketStatus, addReply, ticketStats } =
    useSupport();

  // Basic filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Dialog states
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showPriorityDialog, setShowPriorityDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  // Selected items
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Form states
  const [replyMessage, setReplyMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [assignedAgent, setAssignedAgent] = useState("");

  // UI states
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);

  // Mock data for agents
  const agents = [
    { id: "1", name: "John Doe", avatar: "JD", activeTickets: 5 },
    { id: "2", name: "Jane Smith", avatar: "JS", activeTickets: 3 },
    { id: "3", name: "Bob Johnson", avatar: "BJ", activeTickets: 8 },
  ];

  // Mock canned responses
  const cannedResponses = [
    {
      id: "1",
      title: "Welcome Message",
      content:
        "Thank you for contacting support. We're reviewing your request and will respond shortly.",
    },
    {
      id: "2",
      title: "Request More Info",
      content:
        "To better assist you, could you please provide more details about the issue?",
    },
    {
      id: "3",
      title: "Issue Resolved",
      content:
        "We've resolved your issue. Please let us know if you need any further assistance.",
    },
    {
      id: "4",
      title: "Escalation Notice",
      content:
        "Your ticket has been escalated to our senior team for priority handling.",
    },
  ];

  // Mock internal notes
  const [internalNotes, setInternalNotes] = useState([
    {
      id: "1",
      author: "Admin",
      content: "Customer seems frustrated, prioritize this.",
      timestamp: new Date().toISOString(),
    },
  ]);

  // Handlers
  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowViewDialog(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setIsSubmittingReply(true);
    try {
      await addReply(selectedTicket, replyMessage, attachments);
      setReplyMessage("");
      setAttachments([]);
    } catch (error) {
      toast.error("Failed to add reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleChangeStatus = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setShowStatusDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedTicket || !newStatus) return;

    try {
      await updateTicketStatus(selectedTicket, newStatus);
      setShowStatusDialog(false);
      setSelectedTicket(null);
      setNewStatus("");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Simulate file upload - in production, upload to server
    const newAttachments = Array.from(files).map((file) => file.name);
    setAttachments((prev) => [...prev, ...newAttachments]);
    toast.success(`${newAttachments.length} file(s) attached`);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadAttachment = (filename: string) => {
    toast.info(`Downloading: ${filename}`);
    // In production, fetch the actual file from server
  };

  const handleExport = () => {
    const csvContent = [
      [
        "ID",
        "Tenant",
        "Subject",
        "Status",
        "Priority",
        "Category",
        "Created",
        "Replies",
      ].join(","),
      ...filteredTickets.map((ticket) =>
        [
          ticket.id,
          ticket.tenantName,
          `"${ticket.subject}"`,
          ticket.status,
          ticket.priority,
          ticket.category,
          formatDate(ticket.createdAt),
          ticket.replies.length,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `support-tickets-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    toast.success("Tickets exported successfully");
  };

  // Bulk operations
  const toggleTicketSelection = (ticketId: number) => {};

  const toggleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map((t:any) => t.id));
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    try {
      for (const ticketId of selectedTickets) {
        await updateTicketStatus(ticketId, status as any);
      }
      setSelectedTickets([]);
      setShowBulkDialog(false);
      toast.success(`${selectedTickets.length} tickets updated`);
    } catch (error) {
      toast.error("Failed to update tickets");
    }
  };

  const handleBulkAssign = async (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    toast.success(
      `${selectedTickets.length} tickets assigned to ${agent?.name}`
    );
    setSelectedTickets([]);
  };

  // Priority changes
  const handleChangePriority = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setNewPriority(ticket.priority);
    setShowPriorityDialog(true);
  };

  const handleConfirmPriorityChange = () => {
    if (!selectedTicket || !newPriority) return;
    toast.success(`Priority changed to ${newPriority}`);
    setShowPriorityDialog(false);
    setSelectedTicket(null);
  };

  // Agent assignment
  const handleAssignAgent = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowAssignDialog(true);
  };

  const handleConfirmAssignment = () => {
    if (!selectedTicket || !assignedAgent) return;
    const agent = agents.find((a) => a.id === assignedAgent);
    toast.success(`Ticket assigned to ${agent?.name}`);
    setShowAssignDialog(false);
    setSelectedTicket(null);
    setAssignedAgent("");
  };

  // Templates/Canned responses
  const handleUseCannedResponse = (content: string) => {
    setReplyMessage(content);
    setShowTemplatesDialog(false);
    toast.success("Template inserted");
  };

  // Internal notes
  const handleAddInternalNote = () => {
    if (!internalNote.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      author: "Current Admin",
      content: internalNote,
      timestamp: new Date().toISOString(),
    };

    setInternalNotes([...internalNotes, newNote]);
    setInternalNote("");
    toast.success("Internal note added");
  };

  const handleDeleteNote = (noteId: string) => {
    setInternalNotes(internalNotes.filter((n) => n.id !== noteId));
    toast.success("Note deleted");
  };

  // Auto-save draft
  useEffect(() => {
    if (replyMessage && selectedTicket) {
      const timer = setTimeout(() => {
        // In production, save to localStorage or backend
        localStorage.setItem(`draft-${selectedTicket.id}`, replyMessage);
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [replyMessage, selectedTicket]);

  // SLA calculations (24h response time, 72h resolution time)
  const getSLAStatus = (ticket: SupportTicket) => {
    const created = new Date(ticket.created_at).getTime();
    const now = Date.now();
    const hoursSinceCreation = (now - created) / (1000 * 60 * 60);

    if (ticket.status === "resolved" || ticket.status === "closed")
      return "met";
    // if (ticket?.replies.length === 0 && hoursSinceCreation > 24)
    //   return "breached";
    if (hoursSinceCreation > 72) return "breached";
    if (hoursSinceCreation > 60) return "warning";
    return "ok";
  };

  const breachedSLA =
    tickets?.filter((t) => t?.sla_status === "breached")?.length || 0;

  const filteredTickets = tickets
    ?.filter((ticket) => {
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter;
      const matchesCategory =
        categoryFilter === "all" || ticket.category === categoryFilter;
      return (
        matchesSearch && matchesStatus && matchesPriority && matchesCategory
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
          );
        case "replies":
          return b.replies.length - a.replies.length;
        default:
          return 0;
      }
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "warning";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const parseTrendValue = (trendStr?: string): number => {
    if (!trendStr) return 0;
    return (
      parseFloat(trendStr.replace("%", "").replace("+", "").replace("-", "")) ||
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Support Tickets
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage and respond to tenant support requests
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Total Tickets"
          value={ticketStats?.data?.total_tickets?.toString() || "0"}
          icon={MessageSquare}
          trend={{
            value: parseTrendValue(
              ticketStats?.data?.percentages?.total_change
            ),
            isPositive:
              !!ticketStats?.data?.percentages?.total_change?.includes("+"),
          }}
        />
        <StatsCard
          title="Open"
          value={ticketStats?.data?.open_tickets?.toString() || "0"}
          icon={AlertCircle}
          trend={{
            value: parseTrendValue(ticketStats?.data?.percentages?.open_change),
            isPositive:
              !!ticketStats?.data?.percentages?.open_change?.includes("+"),
          }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="In Progress"
          value={ticketStats?.data?.in_progress_tickets?.toString() || "0"}
          icon={Clock}
          trend={{
            value: parseTrendValue(
              ticketStats?.data?.percentages?.in_progress_change
            ),
            isPositive:
              !!ticketStats?.data?.percentages?.in_progress_change?.includes(
                "+"
              ),
          }}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
        <StatsCard
          title="Resolved"
          value={ticketStats?.data?.resolved_tickets?.toString() || "0"}
          icon={CheckCircle}
          trend={{
            value: parseTrendValue(
              ticketStats?.data?.percentages?.resolved_change
            ),
            isPositive:
              !!ticketStats?.data?.percentages?.resolved_change?.includes("+"),
          }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Urgent"
          value={ticketStats?.data?.urgent_tickets?.toString() || "0"}
          icon={AlertCircle}
          trend={{
            value: parseTrendValue(
              ticketStats?.data?.percentages?.urgent_change
            ),
            isPositive:
              !!ticketStats?.data?.percentages?.urgent_change?.includes("+"),
          }}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Filters */}
      <Card className="bg-white/90 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* First Row: Search and Primary Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by subject, tenant, or description..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Status ({tickets?.length || 0})
                  </SelectItem>
                  <SelectItem value="open">
                    Open (
                    {tickets?.filter((t) => t?.status === "open")?.length || 0})
                  </SelectItem>
                  <SelectItem value="in_progress">
                    In Progress (
                    {tickets?.filter((t) => t?.status === "in_progress")
                      ?.length || 0}
                    )
                  </SelectItem>
                  <SelectItem value="resolved">
                    Resolved (
                    {tickets?.filter((t) => t?.status === "resolved")?.length ||
                      0}
                    )
                  </SelectItem>
                  <SelectItem value="closed">
                    Closed (
                    {tickets?.filter((t) => t?.status === "closed")?.length ||
                      0}
                    )
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Second Row: Additional Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="feature-request">
                    Feature Request
                  </SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="replies">Most Replies</SelectItem>
                </SelectContent>
              </Select>

              {/* Bulk Actions */}
              {selectedTickets.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkDialog(true)}
                  >
                    Bulk Actions ({selectedTickets.length})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTickets([])}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">
              Showing {filteredTickets?.length || "--"} of{" "}
              {tickets?.length || "--"} tickets
            </div>
            {breachedSLA > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                {breachedSLA} SLA Breached
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets List Header */}
      {filteredTickets?.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedTickets?.length === filteredTickets?.length}
              onChange={toggleSelectAll}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All
            </span>
          </div>
          {selectedTickets?.length > 0 && (
            <span className="text-sm text-gray-600">
              {selectedTickets?.length} tickets selected
            </span>
          )}
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets?.map((ticket) => {
          const slaStatus = getSLAStatus(ticket);
          const isSelected = selectedTickets.includes(String(ticket.id));

          return (
            <Card
              key={ticket.id}
              className={`bg-white/90 backdrop-blur-xl hover:shadow-lg transition-shadow group ${
                isSelected ? "ring-2 ring-blue-500" : ""
              } ${
                slaStatus === "breached"
                  ? "border-l-4 border-l-red-500"
                  : slaStatus === "warning"
                  ? "border-l-4 border-l-yellow-500"
                  : ""
              }`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-2 sm:gap-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTicketSelection(Number(ticket.id))}
                    className="mt-1 rounded border-gray-300"
                  />

                  {/* Icon */}
                  <div
                    className={`hidden sm:flex w-12 h-12 rounded-xl items-center justify-center flex-shrink-0 ${
                      ticket.priority === "urgent"
                        ? "bg-red-100"
                        : ticket.priority === "high"
                        ? "bg-orange-100"
                        : ticket.priority === "medium"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <MessageSquare
                      className={`w-6 h-6 ${
                        ticket.priority === "urgent"
                          ? "text-red-600"
                          : ticket.priority === "high"
                          ? "text-orange-600"
                          : ticket.priority === "medium"
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-lg text-gray-900">
                        {ticket.subject}
                      </h3>
                      <Badge variant={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <StatusBadge status={ticket.status} type="ticket" />
                      {slaStatus === "breached" && (
                        <Badge variant="destructive" className="gap-1">
                          <Clock className="w-3 h-3" />
                          SLA Breached
                        </Badge>
                      )}
                      {slaStatus === "warning" && (
                        <Badge variant="warning" className="gap-1">
                          <Clock className="w-3 h-3" />
                          SLA Warning
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{ticket.tenant_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{ticket.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{ticket?.replies?.length || "0"} replies</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      <Eye className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChangeStatus(ticket)}
                        className="w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Status
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChangePriority(ticket)}
                        className="w-full"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Priority
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignAgent(ticket)}
                        className="w-full"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Assign
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTickets?.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No tickets found matching your criteria
            </p>
          </CardContent>
        </Card>
      )}

      {/* View Ticket Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Ticket Details</DialogTitle>
            <DialogDescription>
              View conversation and respond to ticket
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6 py-4">
              {/* Ticket Header */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedTicket.priority === "urgent"
                      ? "bg-red-100"
                      : selectedTicket.priority === "high"
                      ? "bg-orange-100"
                      : selectedTicket.priority === "medium"
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  <MessageSquare
                    className={`w-8 h-8 ${
                      selectedTicket.priority === "urgent"
                        ? "text-red-600"
                        : selectedTicket.priority === "high"
                        ? "text-orange-600"
                        : selectedTicket.priority === "medium"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedTicket.subject}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                    <StatusBadge status={selectedTicket.status} type="ticket" />
                    <span className="text-sm text-gray-600">
                      #{selectedTicket.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Tenant</Label>
                  <p className="font-medium">{selectedTicket.tenant_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Category</Label>
                  <p className="font-medium">{selectedTicket.category}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Created By</Label>
                  <p className="font-medium">{selectedTicket.created_by}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Created At</Label>
                  <p className="font-medium">
                    {formatDate(selectedTicket.created_at)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-gray-600">Description</Label>
                <p className="mt-1 text-gray-900">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Conversation */}
              {/*  <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Conversation</Label>
                  <span className="text-sm text-gray-600">
                    {selectedTicket.replies.length} replies
                  </span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedTicket.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-4 rounded-lg ${
                        reply.authorRole === "super_admin"
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "bg-gray-50 border-l-4 border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {reply.authorName}
                          </span>
                          <Badge
                            variant={
                              reply.authorRole === "super_admin"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {reply.authorRole === "super_admin"
                              ? "Admin"
                              : "Customer"}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {reply.message}
                      </p>
                      {reply.attachments && reply.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-600 font-medium">
                            Attachments:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {reply.attachments.map((attachment, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  handleDownloadAttachment(attachment)
                                }
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                              >
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-700">
                                  {attachment}
                                </span>
                                <Download className="w-3 h-3 text-gray-500" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Reply Form */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reply">Add Reply</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTemplatesDialog(true)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Templates
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotesDialog(true)}
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      Notes
                    </Button>
                  </div>
                </div>

                <Textarea
                  id="reply"
                  placeholder="Type your response..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />

                {draftSaved && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Draft saved
                  </p>
                )}

                {/* File Upload */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <Paperclip className="mr-2 h-4 w-4" />
                      Attach Files
                    </Button>
                    {attachments.length > 0 && (
                      <span className="text-sm text-gray-600">
                        {attachments.length} file(s) attached
                      </span>
                    )}
                  </div>

                  {/* Attached Files List */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">{file}</span>
                          <button
                            onClick={() => handleRemoveAttachment(index)}
                            className="ml-1 hover:bg-blue-100 rounded-full p-1"
                          >
                            <X className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReply}
                    disabled={isSubmittingReply || !replyMessage.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmittingReply ? "Sending..." : "Send Reply"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleChangeStatus(selectedTicket)}
                  >
                    Change Status
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowViewDialog(false);
                setReplyMessage("");
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Ticket Status</DialogTitle>
            <DialogDescription>
              Update the status of this support ticket
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Ticket:{" "}
                  <span className="font-medium">{selectedTicket.subject}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Status:{" "}
                  <StatusBadge status={selectedTicket.status} type="ticket" />
                </p>
              </div>
              <div>
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newStatus === "resolved" && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    This will mark the ticket as resolved and set the resolution
                    date.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusChange}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Priority Dialog */}
      <Dialog open={showPriorityDialog} onOpenChange={setShowPriorityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Priority</DialogTitle>
            <DialogDescription>
              Update the priority level of this ticket
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Ticket:{" "}
                  <span className="font-medium">{selectedTicket.subject}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Priority:{" "}
                  <Badge variant={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                </p>
              </div>
              <div>
                <Label htmlFor="priority">New Priority</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPriorityDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmPriorityChange}>
              Update Priority
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Agent Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent</DialogTitle>
            <DialogDescription>
              Assign this ticket to a support agent
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Ticket:{" "}
                  <span className="font-medium">{selectedTicket.subject}</span>
                </p>
              </div>
              <div>
                <Label htmlFor="agent">Select Agent</Label>
                <Select value={assignedAgent} onValueChange={setAssignedAgent}>
                  <SelectTrigger id="agent">
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                            {agent.avatar}
                          </div>
                          <span>{agent.name}</span>
                          <span className="text-xs text-gray-500">
                            ({agent.activeTickets} active)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAssignment}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Perform actions on {selectedTickets.length} selected tickets
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleBulkStatusChange("in_progress")}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as In Progress
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleBulkStatusChange("resolved")}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleBulkStatusChange("closed")}
              >
                <X className="w-4 h-4 mr-2" />
                Close Tickets
              </Button>
              <div className="border-t pt-3">
                <Label className="text-sm mb-2 block">Assign to Agent</Label>
                <Select onValueChange={handleBulkAssign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.activeTickets} active)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Canned Responses Dialog */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Canned Responses</DialogTitle>
            <DialogDescription>Choose a template to insert</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-96 overflow-y-auto">
            {cannedResponses.map((response) => (
              <button
                key={response.id}
                onClick={() => handleUseCannedResponse(response.content)}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
              >
                <div className="font-medium text-gray-900 mb-1">
                  {response.title}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {response.content}
                </p>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTemplatesDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Internal Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Internal Notes</DialogTitle>
            <DialogDescription>
              Staff-only notes (not visible to customer)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Existing Notes */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {internalNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{note.author}</Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(note.timestamp)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                </div>
              ))}
            </div>

            {/* Add New Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Add Note</Label>
              <Textarea
                id="note"
                placeholder="Enter internal note..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddInternalNote} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
