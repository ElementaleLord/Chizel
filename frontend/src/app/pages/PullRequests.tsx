import { useState } from 'react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { PullRequestSection } from '../components/chz-comp/PullRequestSection';
// DATA
import { assignedPullRequests, submittedPullRequests } from '../data/userActivity';

import './PullRequests.css';

export function PullRequests() {
  const [isSubmittedExpanded, setIsSubmittedExpanded] = useState(true);
  const [isAssignedExpanded, setIsAssignedExpanded] = useState(true);

  const submitted = [...submittedPullRequests].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );

  const assigned = [...assignedPullRequests].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );

  const totalPRs = submitted.length + assigned.length;

  return (
    <div className="pullrequests-container">
      <ChzHeader pageTitle="Pull Requests" />

      <main className="pullrequests-main">
        <div className="pullrequests-wrapper">
          {/* Header Section */}
          <div className="pullrequests-header">
            <div className="pullrequests-header-left">
              <p className="pullrequests-header-label">Collaboration</p>
              <h1 className="pullrequests-header-title">Pull Requests</h1>
              <p className="pullrequests-header-description">
                Track pull requests you submitted alongside work waiting on your review or assigned attention.
              </p>
            </div>
            <div className="pullrequests-header-stats">
              {totalPRs} pull requests in view
            </div>
          </div>

          {/* Sections */}
          <div className="pullrequests-sections">
            <PullRequestSection
              title="Submitted by you"
              description="Your most recent pull requests, newest first."
              items={submitted}
              isExpanded={isSubmittedExpanded}
              onToggle={() => setIsSubmittedExpanded((current) => !current)}
            />
            <PullRequestSection
              title="Received or assigned to you"
              description="Pull requests where you are a reviewer, assignee, or direct recipient."
              items={assigned}
              isExpanded={isAssignedExpanded}
              onToggle={() => setIsAssignedExpanded((current) => !current)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
