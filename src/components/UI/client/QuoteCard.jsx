import { AlertCircle, Badge, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";
import { Button } from "../button";

const QuoteCard = ({ quote, onQuoteAction, statusColor }) => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{quote.title}</CardTitle>
                        <CardDescription>{quote.id}</CardDescription>
                    </div>
                    <Badge className={statusColor(quote.status)}>{quote.status}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-sm">{quote.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar size={16} className="text-muted-foreground" />
                            <span>Date: {quote.date}</span>
                        </div>
                        {quote.price && (
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span>Quote Amount: {quote.price}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <AlertCircle size={16} className="text-muted-foreground" />
                            <span>Location: {quote.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FileText size={16} className="text-muted-foreground" />
                            <span>Attachments: {quote.attachments}</span>
                        </div>
                    </div>
                </div>            </CardContent>            
            <CardFooter className="flex justify-end">
                {quote.status === 'Pending' && (
                    <div className="flex gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => onQuoteAction(quote.id, 'Accept')}
                        >
                            Accept Quote
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onQuoteAction(quote.id, 'Reject')}
                        >
                            Reject
                        </Button>
                    </div>
                )}
                {quote.status === 'Accepted' && (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                        <span>✓ Quote Accepted</span>
                        {quote.acceptedDate && <span className="text-sm text-muted-foreground">on {quote.acceptedDate}</span>}
                    </div>
                )}
                {quote.status === 'Rejected' && (
                    <div className="flex items-center gap-2 text-red-600 font-medium">
                        <span>✗ Quote Rejected</span>
                        {quote.rejectedDate && <span className="text-sm text-muted-foreground">on {quote.rejectedDate}</span>}
                    </div>
                )}
                {quote.status === 'Expired' && (
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <span>⏰ Quote Expired</span>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};

export default QuoteCard;