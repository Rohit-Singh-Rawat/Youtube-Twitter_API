# YT_TWITTER API

YT_TWITTER API serves as the backend infrastructure for a hybrid social media platform combining elements of YouTube and Twitter. It offers a robust set of APIs and services for managing user accounts, tweets, subscriptions, playlists, likes, health checks, dashboard statistics, and video comments. The backend is architected for deployment on various server platforms, facilitating seamless integration into frontend applications to deliver immersive social media experiences.

## Table of Contents

- [Key Takeaways](#key-takeaways)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Postman Collection](#postman-collection)
- [Endpoints](#endpoints)

## Key Takeaways
### (Things I Learned)
- Refresh Token- (how they are different from access token, refresh token rotation, reuse detection)
- Modular and scalable backend architecture in Typescript.
- Multer and Cloudinary (learned how about multer, cloudinary. Installed 'cloudinary-build-url' to get public_Id.)
- Aggregate Pipelines (how they are different from query and populate)
- pagination
- Indexing (how indexing helps in fast searches while read but effect write speed)
  

## Features

- **User Management**: Users can sign up, log in, and manage their profiles.
- **Content Creation**: Users can create and publish tweets, comments, likes, and videos.
- **Content Organization**: Users can organize content into playlists.
- **Content Discovery**: Users can discover new content through search, trending topics, and recommendations.
- **User Interaction**: Users can interact with each other through commenting, liking, and sharing.


  
## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT for authentication
- zod for validation
- multer, cloudinary 
  
## Installation

To install the YT_TWITTER API, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/Rohit-Singh-Rawat/Youtube-Twitter_API.git
   ```
2. Install dependencies:

   ```bash
    npm install
    ```
     
3. Set up environment variables:Create a .env file in the root directory and add the following environment variables:
      ```bash
     MONGODB_URI=YOUR_MONGODB_URI
    PORT=ANY_PORT_OR_8000
    CORS_ORIGIN=ORIGINS
    ACCESS_TOKEN_SECRET=YOUR_ACCESS_TOKEN_SECRET
    ACCESS_TOKEN_EXPIRY=TIME
    REFRESH_TOKEN_SECRET=YOUR_REFRESH_TOKEN_SECRET
    REFRESH_TOKEN_EXPIRY=TIME
    CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
    CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
    CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
   ```

The server should now be running on http://localhost:8000 (or the port you specified).

## Environment Variables

- **MONGODB_URI:** MongoDB connection URI.
- **PORT:** Port on which the server will run.
- **CORS_ORIGIN:** Origins allowed for CORS.
- **ACCESS_TOKEN_SECRET:** Secret key for generating access tokens.
- **ACCESS_TOKEN_EXPIRY:** Expiry time for access tokens.
- **REFRESH_TOKEN_SECRET:** Secret key for generating refresh tokens.
- **REFRESH_TOKEN_EXPIRY:** Expiry time for refresh tokens.
- **CLOUDINARY_CLOUD_NAME:** Cloudinary cloud name for file storage.
- **CLOUDINARY_API_KEY:** Cloudinary API key.
- **CLOUDINARY_API_SECRET:** Cloudinary API secret.



## Postman Collection

You can access the Postman collection for the APIs [here](https://www.postman.com/whaleinspace/workspace/apis/collection/32629407-dd13832b-6b15-4a41-aff0-7e87e02d315a?action=share&creator=32629407).

## Endpoints

### User Management

- **Register User**: Allows users to register by providing necessary details like username, email, and password.  
  - Method: `POST`
  - Endpoint: `/api/v1/auth/register`

- **Login User**: Enables users to log in by providing their credentials.  
  - Method: `POST`
  - Endpoint: `/api/v1/auth/login`

- **Logout User**: Logs out the currently authenticated user.  
  - Method: `POST`
  - Endpoint: `/api/v1/auth/logout`

- **Refresh Access Token**: Allows users to refresh their access token, typically used for extending the session.  
  - Method: `POST`
  - Endpoint: `/api/v1/auth/refresh`

- **Get Current User Profile**: Retrieves the profile information of the currently authenticated user.  
  - Method: `GET`
  - Endpoint: `/api/v1/auth/me`

- **Update Current User Profile**: Allows users to update their profile information.  
  - Method: `PATCH`
  - Endpoint: `/api/v1/auth/me`

- **Change Password**: Allows users to change their password.  
  - Method: `PATCH`
  - Endpoint: `/api/v1/auth/change-password`

### Tweet Management

- **Create Tweet**: Allows users to create a new tweet.  
  - Method: `POST`
  - Endpoint: `/api/v1/tweets`

- **Get All Tweets**: Retrieves all tweets from the database.  
  - Method: `GET`
  - Endpoint: `/api/v1/tweets`

- **Get Tweet by ID**: Retrieves a specific tweet by its ID.  
  - Method: `GET`
  - Endpoint: `/api/v1/tweets/:tweetId`

- **Update Tweet**: Allows users to update their tweets.  
  - Method: `PATCH`
  - Endpoint: `/api/v1/tweets/:tweetId`

- **Delete Tweet**: Allows users to delete their tweets.  
  - Method: `DELETE`
  - Endpoint: `/api/v1/tweets/:tweetId`

### Subscription Management

- **Subscribe to User**: Allows users to subscribe to other users.  
  - Method: `POST`
  - Endpoint: `/api/v1/subscriptions/:userId`

- **Unsubscribe from User**: Allows users to unsubscribe from other users.  
  - Method: `DELETE`
  - Endpoint: `/api/v1/subscriptions/:userId`

- **Get User Subscribers**: Retrieves the list of subscribers for a user.  
  - Method: `GET`
  - Endpoint: `/api/v1/subscriptions/subscribers`

- **Get User Subscriptions**: Retrieves the list of subscriptions for a user.  
  - Method: `GET`
  - Endpoint: `/api/v1/subscriptions/subscriptions`

### Playlist Management

- **Create Playlist**: Allows users to create a new playlist.  
  - Method: `POST`
  - Endpoint: `/api/v1/playlists`

- **Get All Playlists**: Retrieves all playlists from the database.  
  - Method: `GET`
  - Endpoint: `/api/v1/playlists`

- **Get Playlist by ID**: Retrieves a specific playlist by its ID.  
  - Method: `GET`
  - Endpoint: `/api/v1/playlists/:playlistId`

- **Update Playlist**: Allows users to update their playlists.  
  - Method: `PATCH`
  - Endpoint: `/api/v1/playlists/:playlistId`

- **Delete Playlist**: Allows users to delete their playlists.  
  - Method: `DELETE`
  - Endpoint: `/api/v1/playlists/:playlistId`

### Like Management

- **Toggle Video Like**: Allows users to like or unlike a video.  
  - Method: `POST`
  - Endpoint: `/api/v1/likes/toggle/v/:videoId`

- **Toggle Comment Like**: Allows users to like or unlike a comment.  
  - Method: `POST`
  - Endpoint: `/api/v1/likes/toggle/c/:commentId`

- **Toggle Tweet Like**: Allows users to like or unlike a tweet.  
  - Method: `POST`
  - Endpoint: `/api/v1/likes/toggle/t/:tweetId`

- **Get Liked Videos**: Retrieves the list of videos liked by a user.  
  - Method: `GET`
  - Endpoint: `/api/v1/likes/videos`

### Dashboard

- **Get Channel Stats**: Retrieves statistics for the user's channel, such as total views, likes, subscribers, and videos.  
  - Method: `GET`
  - Endpoint: `/api/v1/dashboard/stats`

- **Get Channel Videos**: Retrieves all videos uploaded by the user.  
  - Method: `GET`
  - Endpoint: `/api/v1/dashboard/videos`

### Video Management

- **Get All Videos**: Retrieves all videos from the database.  
  - Method: `GET`
  - Endpoint: `/api/v1/videos`

- **Upload Video**: Allows users to upload a new video.  
  - Method: `POST`
  - Endpoint: `/api/v1/videos`

- **Get Video by ID**: Retrieves a specific video by its ID.  
  - Method: `GET`
  - Endpoint: `/api/v1/videos/v/:videoId`

- **Update Video**: Allows users to update their videos.  
  - Method: `PATCH`
  - Endpoint: `/api/v1/videos/v/:videoId`

- **Delete Video**: Allows users to delete their videos.  
  - Method: `DELETE`
  - Endpoint: `/api/v1/videos/v/:videoId`

- **Publish Video**: Allows users to publish a video.  
  - Method: `POST`
  - Endpoint: `/api/v1/videos`

- **Toggle Publish Status**: Allows users to toggle the publish status of a video.  
  - Method: `PATCH`
  - Endpoint: `/api/v1/videos/toggle/publish/:videoId`

### Comment Management

- **Get Video Comments**: Retrieves all comments for a specific video.  
  - Method: `GET`
  - Endpoint: `/api/v1/comments/:videoId`

- **Add Comment**: Allows users to add a new comment to a video.  
  - Method: `POST`
  - Endpoint: `/api/v1/comments/:videoId`


**Update Comment**: Allows users to update their comments.  
- Method: `PATCH`
- Endpoint: `/api/v1/comments/c/:commentId`

**Delete Comment**: Allows users to delete their comments.  
- Method: `DELETE`
- Endpoint: `/api/v1/comments/c/:commentId`


