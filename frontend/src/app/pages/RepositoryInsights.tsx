import { useParams, Link } from 'react-router';
import { ChevronRight, GitCommit, Users, Star, GitFork, TrendingUp } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
// DATA
import { insightsStats, commitActivity, topContributors, languageDistribution } from '../data/insightsData';

import './RepositoryInsights.css';

export function RepositoryInsights() {
  const { owner, repo } = useParams();

  return (
    <>
      <ChzHeader pageTitle={`${owner} / ${repo}`} />
      <RepositoryLayout>
        <div className="insights-wrapper">
          <div className="insights-container">
            {/* Header */}
            <div className="insights-header">
              <div className="insights-breadcrumb">
                <Link to={`/repository/${owner}/${repo}`} className="insights-breadcrumb-link">
                  {owner}/{repo}
                </Link>
                <ChevronRight className="insights-breadcrumb-icon" />
                <span className="insights-breadcrumb-text">Insights</span>
              </div>
              <h1 className="insights-title">Repository Insights</h1>
            </div>

            {/* Stats Grid */}
            <div className="insights-stats-grid">
              <div className="insights-stat-card">
                <div className="insights-stat-header">
                  <GitCommit className="insights-stat-icon insights-stat-icon-commits" />
                  <span className="insights-stat-label">Total Commits</span>
                </div>
                <div className="insights-stat-value">{insightsStats.commits.total}</div>
                <div className="insights-stat-change insights-stat-change-positive">
                  {insightsStats.commits.change}
                </div>
              </div>

              <div className="insights-stat-card">
                <div className="insights-stat-header">
                  <Users className="insights-stat-icon insights-stat-icon-contributors" />
                  <span className="insights-stat-label">Contributors</span>
                </div>
                <div className="insights-stat-value">{insightsStats.contributors.count}</div>
                <div className="insights-stat-change insights-stat-change-neutral">
                  {insightsStats.contributors.status}
                </div>
              </div>

              <div className="insights-stat-card">
                <div className="insights-stat-header">
                  <Star className="insights-stat-icon insights-stat-icon-stars" />
                  <span className="insights-stat-label">Stars</span>
                </div>
                <div className="insights-stat-value">{insightsStats.stars.count}</div>
                <div className="insights-stat-change insights-stat-change-positive">
                  {insightsStats.stars.change}
                </div>
              </div>

              <div className="insights-stat-card">
                <div className="insights-stat-header">
                  <GitFork className="insights-stat-icon insights-stat-icon-forks" />
                  <span className="insights-stat-label">Forks</span>
                </div>
                <div className="insights-stat-value">{insightsStats.forks.count}</div>
                <div className="insights-stat-change insights-stat-change-neutral">
                  {insightsStats.forks.status}
                </div>
              </div>
            </div>

            {/* Commit Activity */}
            <div className="insights-activity-card">
              <div className="insights-activity-header">
                <TrendingUp className="insights-activity-icon" />
                <h2 className="insights-activity-title">Commit Activity</h2>
              </div>
              <div className="insights-activity-list">
                {commitActivity.map((activity) => {
                  const maxCommits = Math.max(...commitActivity.map(a => a.commits));
                  const barWidth = (activity.commits / maxCommits) * 100;
                  return (
                    <div key={activity.day} className="insights-activity-item">
                      <span className="insights-activity-day">{activity.day}</span>
                      <div className="insights-activity-bar-container">
                        <div
                          className="insights-activity-bar"
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                      <span className="insights-activity-count">
                        {activity.commits}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Grid - Contributors and Languages */}
            <div className="insights-bottom-grid">
              {/* Top Contributors */}
              <div className="insights-section-card">
                <h2 className="insights-section-title">Top Contributors</h2>
                <div className="insights-contributors-list">
                  {topContributors.map((contributor) => (
                    <div key={contributor.name} className="insights-contributor-item">
                      <div className="insights-contributor-avatar">
                        {contributor.avatar}
                      </div>
                      <div className="insights-contributor-content">
                        <div className="insights-contributor-name">{contributor.name}</div>
                        <div className="insights-contributor-commits">
                          {contributor.commits} commits
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Distribution */}
              <div className="insights-section-card">
                <h2 className="insights-section-title">Language Distribution</h2>
                <div className="insights-languages-list">
                  {languageDistribution.map((lang) => (
                    <div key={lang.lang} className="insights-language-item">
                      <div className="insights-language-header">
                        <span className="insights-language-name">{lang.lang}</span>
                        <span className="insights-language-percent">{lang.percent}%</span>
                      </div>
                      <div className="insights-language-bar-container">
                        <div
                          className={`insights-language-bar ${lang.cssClass}`}
                          style={{ width: `${lang.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </RepositoryLayout>
    </>
  );
}