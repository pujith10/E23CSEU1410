***Stage 1: REST API & Real-Time Mechanism***

- Created a full suite of RESTful endpoints for notification creation, retrieval, and management.

- Added a **Server-Sent Events (SSE)** channel.

***Stage 2: Persistent Storage Design***

- Chose **PostgreSQL**(But failed to use in local due to device lagging so implemented mock javascript objects.)

- Designed the main schema around `nx_students` and `nx_notifications`

***Stage 3: Query Analysis & Optimization***

- Instead of a direct `SELECT *` retrieval, I considered the possibility of having millions of rows in tables.

- Built two compound indexes `(student_id is_read created_at DESC)` and `(notification_type, created_at DESC)`.

***Stage 4: Performance Caching Strategy***

- failed to use **Redis** as device is lagging in performance.

***Stage 5: Bulk Notify Redesign*** - Changed the simple sequential dispatch loop to an asynchronous batch-processing pipeline.

- Used BullMQ.

***Stage 6: Priority Inbox Algorithm*** - Designed a stateless exponential decay approach to compute priority scores live.

***Stage 7: Frontend Architecture*** - Constructed the UI with **Next.js 14 (App Router)** and **React 18**.