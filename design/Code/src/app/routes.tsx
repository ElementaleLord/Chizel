import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Repository from "./pages/Repository";
import CommitHistory from "./pages/CommitHistory";
import PullRequests from "./pages/PullRequests";
import Account from "./pages/Account";
import Notifications from "./pages/Notifications";
import Starred from "./pages/Starred";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/notifications",
    Component: Notifications,
  },
  {
    path: "/starred",
    Component: Starred,
  },
  {
    path: "/repo/:owner/:name",
    Component: Repository,
  },
  {
    path: "/repo/:owner/:name/commits/:branch?",
    Component: CommitHistory,
  },
  {
    path: "/repo/:owner/:name/pulls",
    Component: PullRequests,
  },
  {
    path: "/account/:username",
    Component: Account,
  },
]);