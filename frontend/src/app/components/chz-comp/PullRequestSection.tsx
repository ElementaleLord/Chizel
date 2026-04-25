import { Link } from 'react-router';
import { ChevronDown, MessageSquare } from 'lucide-react';
// COMPONENTS
import { getPullRequestStatusStyles } from '../utils/prStatusStyles';
// DATA
import type { UserPullRequestItem } from '../../data/userActivity';

import './PullRequestSection.css';

interface PullRequestSectionProps {
  title: string;
  description: string;
  items: UserPullRequestItem[];
  isExpanded: boolean;
  onToggle: () => void;
}

export function PullRequestSection({
  title,
  description,
  items,
  isExpanded,
  onToggle,
}: PullRequestSectionProps) {
  return (
    <section className="prsection-container">
      <div className="prsection-header">
        <div className="prsection-header-content">
          <h2 className="prsection-title">{title}</h2>
          <p className="prsection-description">{description}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="prsection-toggle-btn"
          aria-expanded={isExpanded}
        >
          <ChevronDown
            className={`prsection-toggle-icon ${!isExpanded ? 'prsection-toggle-icon-collapsed' : ''}`}
          />
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {isExpanded && (
        <div className="prsection-content">
          {items.map((pr) => {
            const { badge: badgeClassName, icon: StatusIcon, iconClassName, label } = getPullRequestStatusStyles(pr.status);

            return (
              <Link
                key={pr.id}
                to={pr.href}
                className="prsection-item"
              >
                <div className={`prsection-item-icon ${badgeClassName}`}>
                  <StatusIcon className={`h-4 w-4 ${iconClassName}`} />
                </div>
                <div className="prsection-item-content">
                  <div className="prsection-item-title-row">
                    <h3 className="prsection-item-title">{pr.title}</h3>
                    <span className="prsection-item-number">#{pr.number}</span>
                    <span className={`prsection-item-badge ${badgeClassName}`}>{label}</span>
                  </div>
                  <p className="prsection-item-repo">
                    {pr.repo} / opened by {pr.author}
                    {pr.assignedTo ? ` / assigned to ${pr.assignedTo}` : ''}
                  </p>
                  <div className="prsection-item-meta">
                    <span>{pr.time}</span>
                    <span className="prsection-item-comment">
                      <MessageSquare className="prsection-item-comment-icon" />
                      {pr.comments} comments
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
