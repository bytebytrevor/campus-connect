# CampusConnect Project Plan

## Requirements

### Core Requirements

#### 1. Event Directory (Core)
- **Description**: A searchable directory of campus events (workshops, club meetings, etc.). Students can filter events by category, date, or location and RSVP to attend.
- **User Stories**:
  - View Events: As a student, I want to browse a list of upcoming events so I can attend ones that interest me.
  - Filter Events: As a student, I want to filter events by category or date so I can quickly find relevant activities.
  - RSVP to Event: As a student, I want to mark events I plan to attend so I can receive reminders.

#### 2. Study Group Finder (Core)
- **Description**: Students can create or join study groups based on course codes or topics. Each group includes a chat link or meeting invite.
- **User Stories**:
  - Create Study Group: As a student, I want to create a study group for a course so that others can join and collaborate.
  - Join Study Group: As a student, I want to browse and join existing study groups based on my courses.

#### 3. User Profiles & Authentication (Core)
- **Description**: Students can register, log in, and create profiles that display their major, year, and interests. Authentication is handled securely.
- **User Stories**:
  - Edit Profile: As a user, I want to update my personal info and interests so that my profile stays current.

#### 4. Notifications & Reminders (Core)
- **Description**: Sends reminders about upcoming events or group meetings through in-app notifications or email.
- **User Stories**:
  - Get Notifications: As a user, I want to receive reminders about upcoming events or study group meetings.

### Enhancement Requirements

#### 5. Interactive Campus Map (Enhancement)
- **Description**: Map view for event locations using Google Maps API.
- **User Stories**:
  - View Campus Map: As a student, I want to view an interactive campus map with event pins so I can easily locate where events or study groups are taking place.

## Project Schedule

| Sprint | Milestone(s) |
|--------|-------------|
| 1 | Project setup, repository creation, database schema design, authentication module, and UI wireframes. |
| 2 | Event Directory implementation (CRUD), event filters, and basic UI integration. |
| 3 | Study Group Finder module (create/join groups), notifications system, and user profile management. |
| 4 | Enhancement features (Campus Map), testing, documentation, and deployment. |

## Project Architecture

CampusConnect will be a web-based client-server application built using a full-stack JavaScript architecture. The frontend (React + Tailwind) will handle the user interface and API requests. The backend (Express.js + Node.js) will manage routes, authentication, and business logic. The database (Firebase) will store all user, event, and group data.

## Technology Stack

| Category | Tools / Technologies |
|----------|---------------------|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | Firebase |
| Authentication | Firebase Authentication |
| Hosting | Firebase |
| Optional APIs | Google Maps API |
| Version Control | Git + GitHub for collaboration and issue tracking |