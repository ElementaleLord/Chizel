import { Bell, CircleDot, GitCommitHorizontal, GitPullRequest, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

interface NotifEntryProp{
    id: number,
    type: string,
    title: string,
    description: string,
    time: string,
    href: string,
    unread: boolean,
    icon: any,
}
function getNotificationMeta(type: string): { label: string; icon: LucideIcon } {
    switch (type) {
        case 'pull_request':
            return { label: 'Pull request', icon: GitPullRequest };
        case 'issue':
            return { label: 'Issue', icon: CircleDot };
        case 'comment':
            return { label: 'Comment', icon: MessageSquare };
        case 'commit':
            return { label: 'Commit', icon: GitCommitHorizontal };
        default:
            return { label: 'Notification', icon: Bell };
    }
}

export function NotificationEntry( { notification } : { notification : NotifEntryProp } ){
    const { icon: Icon, label } = getNotificationMeta(notification.type);

    return (
        <Link
            key={notification.id}
            to={notification.href}
            className={`flex flex-col gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-secondary/40 sm:flex-row sm:items-start ${
                notification.unread ? 'bg-secondary/20' : ''
            }`}
            >
            <div className="flex items-center gap-3 sm:w-40 sm:shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fda410]/10 text-[#fda410]">
                <Icon className="h-4 w-4" />
                </div>
                <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{notification.title}</p>
                <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ notification.unread ? 
                        'bg-[#fda410]/15 text-[#fda410]' : 'bg-secondary text-muted-foreground' }`
                    }
                >
                    {notification.unread ? 'Unread' : 'Read'}
                </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.description}</p>
            </div>
        </Link>
    )
}