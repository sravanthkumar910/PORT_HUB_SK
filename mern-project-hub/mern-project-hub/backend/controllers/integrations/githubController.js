import asyncHandler from "express-async-handler";
import fetch from "node-fetch";
import User from "../../models/User.js";

const GITHUB_API = "https://api.github.com";

const ghHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "project-hub-app",
});

// @route POST /api/integrations/github/connect
// Body: { username, token }  (a GitHub Personal Access Token)
export const connectGithub = asyncHandler(async (req, res) => {
  const { username, token } = req.body;
  if (!username || !token) {
    res.status(400);
    throw new Error("GitHub username and token are required");
  }

  // Verify token works before saving it
  const check = await fetch(`${GITHUB_API}/user`, { headers: ghHeaders(token) });
  if (!check.ok) {
    res.status(400);
    throw new Error("Invalid GitHub token - could not authenticate");
  }

  const user = await User.findById(req.user._id);
  user.integrations.github = { connected: true, username, token };
  await user.save();

  res.json({ connected: true, username });
});

export const disconnectGithub = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.integrations.github = { connected: false, username: "", token: "" };
  await user.save();
  res.json({ connected: false });
});

// @route GET /api/integrations/github/activity
// Live: recent commits/events + repo list, used to drive the "live monitoring" panel
export const getGithubActivity = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const gh = user.integrations.github;

  if (!gh?.connected) {
    res.status(400);
    throw new Error("GitHub is not connected");
  }

  const [reposRes, eventsRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${gh.username}/repos?sort=updated&per_page=10`, {
      headers: ghHeaders(gh.token),
    }),
    fetch(`${GITHUB_API}/users/${gh.username}/events/public?per_page=15`, {
      headers: ghHeaders(gh.token),
    }),
  ]);

  const repos = reposRes.ok ? await reposRes.json() : [];
  const events = eventsRes.ok ? await eventsRes.json() : [];

  const recentActivity = events.map((e) => ({
    id: e.id,
    type: e.type,
    repo: e.repo?.name,
    createdAt: e.created_at,
  }));

  res.json({
    repos: repos.map((r) => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      updatedAt: r.updated_at,
      openIssues: r.open_issues_count,
    })),
    recentActivity,
  });
});

// @route GET /api/integrations/github/repo/:owner/:repo
// Pull live status for one repo (e.g. linked from a Project's githubRepo field)
export const getRepoStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const gh = user.integrations.github;
  if (!gh?.connected) {
    res.status(400);
    throw new Error("GitHub is not connected");
  }

  const { owner, repo } = req.params;
  const [repoRes, commitsRes] = await Promise.all([
    fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers: ghHeaders(gh.token) }),
    fetch(`${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=5`, { headers: ghHeaders(gh.token) }),
  ]);

  if (!repoRes.ok) {
    res.status(404);
    throw new Error("Repository not found or not accessible");
  }

  const repoData = await repoRes.json();
  const commits = commitsRes.ok ? await commitsRes.json() : [];

  res.json({
    name: repoData.full_name,
    description: repoData.description,
    url: repoData.html_url,
    openIssues: repoData.open_issues_count,
    defaultBranch: repoData.default_branch,
    updatedAt: repoData.updated_at,
    recentCommits: commits.map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit?.message,
      author: c.commit?.author?.name,
      date: c.commit?.author?.date,
    })),
  });
});
