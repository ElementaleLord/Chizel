import { useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { Landing } from './pages/Landing';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { Home } from './pages/Home';
import { Activity } from './pages/Activity';
import { Repositories } from './pages/Repositories';
import { Stars } from './pages/Stars';
import { Repository } from './pages/Repository';
import { RepositoryCommits } from './pages/RepositoryCommits';
import { RepositoryBranches } from './pages/RepositoryBranches';
import { RepositoryPullRequests } from './pages/RepositoryPullRequests';
import { RepositoryIssues } from './pages/RepositoryIssues';
import { RepositoryInsights } from './pages/RepositoryInsights';
import { RepositorySettings } from './pages/RepositorySettings';
import { RepositoryFile } from './pages/RepositoryFile';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

export default function App() {
  const [msg, setMsg] = useState("");
  const fetchHello = () => {
    axios.get("http://localhost:3000/api/hello")
      .then((response) => setMsg(response.data.message))
      .catch((err) => console.error(err));
  };

  const chzInit = () => {
    setMsg("running binary...");
    axios.post("http://localhost:3000/api/execute", { message: 'init' })
      .then((response) => setMsg(response.data.result))
      .catch((err) => console.error(err));
  };

  const dbTest = () => {
    setMsg("fetching from databse...");
    axios.get("http://localhost:3000/api/password/Chizel")
      .then((response) => setMsg(JSON.stringify(response.data)))
      .catch((err) => console.log(err));
  }

  return (
    <ThemeProvider>
      <div>
        <button onClick={fetchHello}>Call Api</button>
        <br/>
        <button onClick={chzInit}>Make Repo</button>
        <br/>
        <button onClick={dbTest}>Call db</button>
        <br/>
        <div>{msg}</div>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/stars" element={<Stars />} />
          <Route path="/repository/:owner/:repo" element={<Repository />} />
          <Route path="/repository/:owner/:repo/commits" element={<RepositoryCommits />} />
          <Route path="/repository/:owner/:repo/branches" element={<RepositoryBranches />} />
          <Route path="/repository/:owner/:repo/pulls" element={<RepositoryPullRequests />} />
          <Route path="/repository/:owner/:repo/issues" element={<RepositoryIssues />} />
          <Route path="/repository/:owner/:repo/insights" element={<RepositoryInsights />} />
          <Route path="/repository/:owner/:repo/settings" element={<RepositorySettings />} />
          <Route path="/repository/:owner/:repo/blob/:branch/*" element={<RepositoryFile />} />
          <Route path="/repository/:owner/:repo/tree/*" element={<RepositoryFile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
