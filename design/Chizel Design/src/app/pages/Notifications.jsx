import { useState } from "react";
import { Link } from "react-router";
import {
  GitPullRequest,
  GitCommit,
  Star,
  GitFork,
  MessageSquare,
  Check,
  Inbox,
} from "lucide-react";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";

const mockNotifications = [
  {
    id: "1",
    type: "pull_request",
    title: "New pull request in chizel-ui",
    repository: "johndoe/chizel-ui",
    repositoryOwner: "johndoe",
    repositoryName: "chizel-ui",
    message: "Sarah Williams opened pull request #42: Add support for OAuth authentication",
    timestamp: "2026-03-14T09:30:00Z",
    read: false,
    actor: "Sarah Williams",
    actorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    type: "comment",
    title: "New comment on your pull request",
    repository: "johndoe/data-viz-toolkit",
    repositoryOwner: "johndoe",
    repositoryName: "data-viz-toolkit",
    message: "Mike Johnson commented on pull request #38",
    timestamp: "2026-03-14T08:15:00Z",
    read: false,
    actor: "Mike Johnson",
    actorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    type: "star",
    title: "Someone starred your repository",
    repository: "johndoe/chizel-ui",
    repositoryOwner: "johndoe",
    repositoryName: "chizel-ui",
    message: "Jane Smith starred your repository",
    timestamp: "2026-03-13T16:45:00Z",
    read: true,
    actor: "Jane Smith",
    actorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    type: "fork",
    title: "Someone forked your repository",
    repository: "johndoe/api-gateway",
    repositoryOwner: "johndoe",
    repositoryName: "api-gateway",
    message: "Alex Chen forked your repository",
    timestamp: "2026-03-13T14:20:00Z",
    read: true,
    actor: "Alex Chen",
    actorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "5",
    type: "commit",
    title: "New commit in watched repository",
    repository: "opensource/react-library",
    repositoryOwner: "opensource",
    repositoryName: "react-library",
    message: "Emma Davis pushed 3 commits to main",
    timestamp: "2026-03-13T11:30:00Z",
    read: true,
    actor: "Emma Davis",
    actorAvatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "pull_request":
        return <GitPullRequest className="w-5 h-5 text-green-500" />;
      case "commit":
        return <GitCommit className="w-5 h-5 text-blue-500" />;
      case "star":
        return <Star className="w-5 h-5 text-yellow-500" />;
      case "fork":
        return <GitFork className="w-5 h-5 text-purple-500" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const renderNotifications = (notificationList) => {
    if (notificationList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Inbox className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">No notifications</p>
          <p className="text-sm text-muted-foreground">
            You're all caught up!
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {notificationList.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 hover:bg-accent/50 transition-colors ${
              !notification.read ? "bg-accent/20" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              {getIcon(notification.type)}
              <img
                src={notification.actorAvatar}
                alt={notification.actor}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex-1">
                    <p className="mb-1">{notification.message}</p>
                    <Link
                      to={`/repo/${notification.repositoryOwner}/${notification.repositoryName}`}
                      className="text-sm hover:underline"
                      style={{ color: 'var(--chizel-blue)' }}
                    >
                      {notification.repository}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="mt-2"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-2">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-4">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="border rounded-lg overflow-hidden">
              {renderNotifications(notifications)}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <div className="border rounded-lg overflow-hidden">
              {renderNotifications(unreadNotifications)}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
