import { Link } from 'react-router';
import { MoreVertical } from 'lucide-react';

import './FeedItem.css';

interface FeedItemProps{
    user: string,
    avatar: string,
    action: string,
    repo: string,
    title: string,
    status?: string,
    statusColor?: string,
    time: string,
    preview : string,
}

export function FeedItem( { item, index } : { item : FeedItemProps; index: number } ){
    return (
        <div key={index} className="feed-item">
            <div className="feed-item-inner">
                <div className="feed-avatar">
                    {item.avatar}
                </div>
                <div className="feed-content">
                    <div className="feed-meta">
                    <span className="feed-user">{item.user}</span>
                    <span className="feed-action">{item.action}</span>
                    <Link to="#" className="feed-repo-link">
                        {item.repo}
                    </Link>
                    <span className="feed-separator">·</span>
                    <span className="feed-time">{item.time}</span>
                    </div>
                    <h3 className="feed-title-item">{item.title}</h3>
                    {item.status && (
                    <span className={`feed-status ${item.statusColor}`}>
                        {item.status}
                    </span>
                    )}
                    <p className="feed-preview">{item.preview}</p>
                </div>
                <button className="feed-menu-btn">
                    <MoreVertical />
                </button>
            </div>
        </div>
    )
}