# Integration Points and External Dependencies

## External Services
| Service  | Purpose  | Integration Type | Key Files                      |
| -------- | -------- | ---------------- | ------------------------------ |
| Cloudinary | Image hosting | SDK | `backend` file upload endpoints |
| Google OAuth | Authentication | Passport strategy | `backend/src/modules/auth/` |
| PostgreSQL | Primary database | TypeORM | `backend/src/entities/` |
| Redis | Caching/sessions | redis client | `backend` session management |

## Frontend-Backend Communication
- **API Base**: REST endpoints on backend port
- **Authentication**: JWT tokens trong headers
- **File Upload**: Multipart form data
- **Real-time**: Có thể cần WebSocket cho notifications (hiện tại polling)
