import { Badge } from "@/components/UI/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";
import { AlertCircle, Calendar, FileText, MessageSquare, UploadCloud } from "lucide-react";
import { Button } from "../button";

const JobCard = ({ job, onQuoteAction, onAddAttachment, statusColor }) => {
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
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FileText size={16} className="text-muted-foreground" />
                            <span>Attachments: {job.attachments}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => onAddAttachment(job.id)}>
                    <UploadCloud size={16} className="mr-2" />
                    Add Attachment
                </Button>
                <Button variant="outline" size="sm">
                    <MessageSquare size={16} className="mr-2" />
                    Add Note
                </Button>
                {job.type === 'Quote' && (
                    <div className="flex gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => onQuoteAction(job.id, 'Accept')}
                        >
                            Accept Quote
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onQuoteAction(job.id, 'Reject')}
                        >
                            Reject
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};

export default JobCard;