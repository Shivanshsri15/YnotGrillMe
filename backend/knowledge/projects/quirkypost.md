---
id: quirkypost
title: QuirkyPost — MERN blogging platform
summary: "QuirkyPost is described by the owner in a public LinkedIn post as a completed MERN-stack blogging platform designed for bloggers and readers. The product scope described in that post goes beyond basic create/read/update/delete blog posts: it includes authentication, drafting, soc"
stack: [React, MongoDB, JWT, Redux, Gemini]
repo: Shivanshsri15/QuirkyPost
defaultBranch: main
readmeSync: true
skillIds: [react, mongodb, jwt, redux, gemini]
evidenceIds: [github-quirkypost, linkedin-quirkypost]
visibility: public
---
# QuirkyPost — MERN blogging platform

## Project overview

QuirkyPost is described by the owner in a public LinkedIn post as a completed MERN-stack blogging platform designed for bloggers and readers. The product scope described in that post goes beyond basic create/read/update/delete blog posts: it includes authentication, drafting, social interactions, profiles, user discovery, follow relationships, activity indicators, and Gemini-based writing assistance.

**Primary source:** https://www.linkedin.com/posts/shivanshsri15_mernstack-quirkypost-bloggingplatform-activity-7283915866037968897-0VRd
**Repository:** https://github.com/Shivanshsri15/QuirkyPost

The LinkedIn post is a first-party description, not a code audit. Feature claims below should be attributed to the post until the current repository is reviewed end-to-end.

## Stack and technologies

The public post describes a MERN-stack project and explicitly names:
- React Bootstrap for the homepage UI.
- Redux state for preserving blog drafts during the drafting workflow.
- MongoDB for storing blogs and user/blog interaction data.
- JWT for authentication.
- Middleware to protect authenticated routes/pages.
- Gemini AI for blog-writing assistance.
- Multer for profile-picture upload.

Prior repository notes identify React 18, Create React App, React Bootstrap, Bootstrap, and React Icons in the frontend package. The backend's exact framework and data-model implementation should be confirmed from the current source rather than inferred from the term “MERN” alone.

## Functional areas described in the post

### Authentication and protected access

The post describes login and registration using JWT and middleware to protect pages that require an authenticated user. The exact token storage, refresh/expiry behavior, password-hashing implementation, and authorization rules are not specified by the post.

### Homepage and discovery

The homepage uses React Bootstrap and includes trending posts. A “load more” interaction lets readers request additional blog content. The exact ranking formula for trending content, pagination strategy, and backend query behavior are not specified.

### Drafting and publishing

Users can draft, save, and publish blog posts. The post says draft data is held in Redux state so the author can continue from where they left off, and that blogs are saved to MongoDB. It does not establish whether drafts persist across browser refreshes or devices, so avoid claiming server-side draft persistence unless code confirms it.

### Gemini writing assistance

Gemini AI is integrated to help users improve their writing. The post does not specify prompt construction, output validation, rate limits, error handling, or whether generated text is inserted automatically versus suggested to the author. Describe this as writing assistance, not autonomous publication.

### Blog detail and social interactions

The post lists likes, comments, and saved posts. It says interactions are stored in the relevant blog and user databases. The precise schema, counter consistency, pagination, moderation, and concurrency behavior are not documented in the post.

### User profile and activity

Users can edit profile data and upload a profile picture via Multer. A profile page displays the user's posts and saved blogs. The post also describes monthly progress bars for likes, comments, and blogs posted. The exact month boundary, time zone, aggregation logic, and whether metrics are live or precomputed are unknown.

### User search and follow relationships

Users can search for content creators, follow or unfollow them, visit profiles, and explore their activity. The post characterizes this as enabling a personalized feed, but the exact feed ranking and follow-only filtering logic need code verification.

## Engineering questions worth preparing

- How JWTs are created, stored, validated, and expired.
- Whether authentication middleware verifies both identity and resource permissions.
- How drafts move from temporary Redux state to persistent storage.
- How pagination/load-more avoids duplicates and handles new posts.
- How trending posts are selected and refreshed.
- How likes and comments remain consistent under repeated clicks or concurrent updates.
- How saved posts and follows are represented in MongoDB.
- How image uploads validate file type, size, and storage location.
- How Gemini failures, prompt injection, and unsafe generated content are handled.
- How monthly activity counters are calculated and tested.

These are interview prompts, not claims that all corresponding controls are implemented.

## Accurate portfolio wording

“QuirkyPost is a MERN blogging platform I described publicly as including JWT-based authentication, blog drafting and publishing, trending posts, likes/comments/bookmarks, profile editing and image uploads, user search and follow/unfollow, and Gemini-assisted writing. The post identifies React Bootstrap, Redux state, MongoDB, JWT, and Multer in the implementation. Detailed implementation and current deployment status should be checked against the repository before making stronger claims.”

## Evidence limits

- The public LinkedIn post describes the feature set and calls the project complete at the time of posting.
- Current uptime and current repository completeness were not established in this refresh.
- Do not invent user counts, performance metrics, deployment URLs, tests, or security guarantees.
