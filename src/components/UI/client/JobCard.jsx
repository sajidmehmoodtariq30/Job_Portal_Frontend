import { Badge } from "@/components/UI/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";
import { AlertCircle, Calendar, FileText, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";
import { Button } from "../button";

const JobCard = ({ job, statusColor, onViewDetails, quotes = [] }) => {
    // Find quotes related to this job
    const jobQuotes = quotes.filter(quote => quote.jobId === job.id || quote.jobId === job.uuid);
    
    // Helper function to get quote status summary
    const getQuoteStatusSummary = () => {
        if (jobQuotes.length === 0) return null;
        
        const pendingCount = jobQuotes.filter(q => q.status === 'Pending').length;
        const acceptedCount = jobQuotes.filter(q => q.status === 'Accepted').length;
        const rejectedCount = jobQuotes.filter(q => q.status === 'Rejected').length;
        const expiredCount = jobQuotes.filter(q => q.status === 'Expired').length;
        
        if (acceptedCount > 0) {
            return {
                type: 'accepted',
                message: `${acceptedCount} quote${acceptedCount > 1 ? 's' : ''} accepted`,
                icon: CheckCircle,
                color: 'text-green-600 bg-green-50 border-green-200'
            };
        } else if (pendingCount > 0) {
            return {
                type: 'pending',
                message: `${pendingCount} quote${pendingCount > 1 ? 's' : ''} awaiting response`,
                icon: Clock,
                color: 'text-amber-600 bg-amber-50 border-amber-200'
            };
        } else if (rejectedCount > 0) {
            return {
                type: 'rejected',
                message: `${rejectedCount} quote${rejectedCount > 1 ? 's' : ''} rejected`,
                icon: XCircle,
                color: 'text-red-600 bg-red-50 border-red-200'
            };
        } else if (expiredCount > 0) {
            return {
                type: 'expired',
                message: `${expiredCount} quote${expiredCount > 1 ? 's' : ''} expired`,
                icon: Clock,
                color: 'text-gray-600 bg-gray-50 border-gray-200'
            };
        }
        
        return null;
    };

    const quoteStatus = getQuoteStatusSummary();
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>{job.id}</CardDescription>
                    </div>
                    <Badge className={statusColor(job.status)}>{job.status}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-sm">{job.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                            <Calendar size={16} className="text-muted-foreground" />
                            {job.status === 'Completed' ? (
                                <span>Completed: {job.completedDate}</span>
                            ) : job.status === 'Scheduled' ? (
                                <span>Scheduled: {job.date}</span>
                            ) : job.dueDate ? (
                                <span>Due: {job.dueDate}</span>
                            ) : (
                                <span>Created: {job.date}</span>
                            )}
                        </div>
                        {job.assignedTech && (
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="font-normal">Technician: {job.assignedTech}</Badge>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <AlertCircle size={16} className="text-muted-foreground" />
                            <span>Location: {job.location}</span>
                        </div>                        <div className="flex items-center gap-2 text-sm">
                            <FileText size={16} className="text-muted-foreground" />
                            <span>Attachments: {job.attachments}</span>
                        </div>
                        
                        {/* Quote Status Message */}
                        {quoteStatus && (
                            <div className={`flex items-center gap-2 text-sm p-2 rounded border ${quoteStatus.color}`}>
                                <quoteStatus.icon size={16} />
                                <span className="font-medium">{quoteStatus.message}</span>
                                {jobQuotes.length > 0 && (
                                    <Badge variant="outline" className="ml-auto text-xs">
                                        <DollarSign size={12} className="mr-1" />
                                        {jobQuotes.length} quote{jobQuotes.length > 1 ? 's' : ''}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>              <CardFooter className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(job)}
                >
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );
};

export default JobCard;