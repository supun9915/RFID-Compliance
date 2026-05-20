# 🚗 RFID Compliance Service

A Spring Boot-based backend service for managing **RFID-based vehicle compliance**, including vehicle registration, document tracking, real-time RFID tag detection via MQTT, email notifications, and print label management.

---

## 📋 Table of Contents

- [Technologies Used](#-technologies-used)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Security](#-security)
- [MQTT Integration](#-mqtt-integration)
- [Email Notifications](#-email-notifications)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Environment Variables](#-environment-variables)

---

## 🛠 Technologies Used

| Category              | Technology / Library                            | Version      |
|-----------------------|-------------------------------------------------|--------------|
| Language              | Java                                            | 21           |
| Framework             | Spring Boot                                     | 4.0.1        |
| Build Tool            | Gradle                                          | Wrapper      |
| Database              | PostgreSQL                                      | Latest       |
| ORM                   | Spring Data JPA / Hibernate                     | Boot Managed |
| DB Migration          | Flyway                                          | Boot Managed |
| Security              | Spring Security + JWT (JJWT)                    | 0.12.6       |
| Messaging             | MQTT via Eclipse Paho + Spring Integration MQTT | 1.2.5        |
| Email                 | Spring Boot Mail (SMTP / Gmail)                 | Boot Managed |
| JSON                  | Jackson + Jackson JSR310                        | Boot Managed |
| Validation            | Spring Boot Validation (Bean Validation)        | Boot Managed |
| Boilerplate Reduction | Lombok                                          | Boot Managed |
| Connection Pooling    | HikariCP                                        | Boot Managed |
| Testing               | JUnit 5 + Spring Boot Test                      | Boot Managed |

---

## 🏗 Architecture Overview

```
Client / RFID Reader
       │
       ▼
  REST API Layer  ◄──────────────────────────────────────┐
  (Controllers)                                          │
       │                                                 │
       ▼                                                 │
  Service Layer                                          │
  (Business Logic)                                       │
       │                                    MQTT Broker  │
       ▼                                   (HiveMQ/Local)│
  Repository Layer                              │        │
  (Spring Data JPA)                    MqttDetection     │
       │                               Listener ─────────┘
       ▼
  PostgreSQL Database
```

- **Controllers** handle HTTP requests and delegate to **Services**.
- **Services** contain all business logic and call **Repositories**.
- **MQTT Listener** receives RFID tag-read events from Zebra FX9600 readers and routes them to the detection service.
- **Email Service** sends notifications for expired/near-expiry documents triggered during detection.
- **JWT Filter** authenticates every request before it reaches controllers.
- **Flyway** manages all database schema migrations automatically on startup.

---

## 📁 Project Structure

```
compliance-service/
├── build.gradle                          # Gradle build configuration
├── settings.gradle
├── gradlew / gradlew.bat                 # Gradle wrapper scripts
├── data.json                             # Sample/seed data
├── debug_query.sql                       # Utility SQL queries
├── RFID_Compliance_Service.postman_collection.json  # Postman API collection
│
└── src/
    ├── main/
    │   ├── java/com/example/compliance_service/
    │   │   │
    │   │   ├── ComplianceServiceApplication.java     # Application entry point
    │   │   │
    │   │   ├── config/                               # Configuration classes
    │   │   │   ├── DataInitializer.java              # Seeds roles/admin on startup
    │   │   │   ├── JacksonConfig.java                # Jackson ObjectMapper setup
    │   │   │   ├── MqttConfig.java                   # MQTT connection factory & channels
    │   │   │   ├── MqttProperties.java               # MQTT property bindings
    │   │   │   └── SecurityConfig.java               # Spring Security HTTP config
    │   │   │
    │   │   ├── controller/                           # REST API controllers
    │   │   │   ├── AuthController.java               # Login / logout
    │   │   │   ├── DetectionHistoryController.java   # Detection records
    │   │   │   ├── DocumentController.java           # Vehicle documents CRUD
    │   │   │   ├── DocumentTypeController.java       # Document type management
    │   │   │   ├── PublicController.java             # Public/unauthenticated endpoints
    │   │   │   ├── ReaderController.java             # RFID reader management
    │   │   │   ├── RoleController.java               # Role management
    │   │   │   ├── ScanCenterController.java         # Scan center management
    │   │   │   ├── UserController.java               # User CRUD & profile
    │   │   │   ├── VehicleController.java            # Vehicle CRUD
    │   │   │   ├── VehicleMakeController.java        # Vehicle make management
    │   │   │   ├── VehicleModelController.java       # Vehicle model management
    │   │   │   ├── VehiclePrintController.java       # ZPL label print management
    │   │   │   └── VehicleTypeController.java        # Vehicle type management
    │   │   │
    │   │   ├── dto/                                  # Data Transfer Objects
    │   │   │   ├── Enums/
    │   │   │   │   └── EComplianceStatus.java        # COMPLIANT | NEAR_EXPIRY | EXPIRED | MISSING
    │   │   │   ├── request/                          # Inbound request DTOs
    │   │   │   │   ├── LoginRequest.java
    │   │   │   │   ├── RegisterRequest.java
    │   │   │   │   ├── UpdateUserRequest.java
    │   │   │   │   ├── VehicleOwnerRequest.java
    │   │   │   │   ├── VehicleRequest.java
    │   │   │   │   ├── DocumentRequest.java
    │   │   │   │   ├── DocumentTypeRequest.java
    │   │   │   │   ├── ReaderRequest.java
    │   │   │   │   ├── ReadersRequest.java
    │   │   │   │   ├── ReaderCommandRequest.java
    │   │   │   │   ├── RoleRequest.java
    │   │   │   │   ├── ScanCenterRequest.java
    │   │   │   │   ├── VehicleMakeRequest.java
    │   │   │   │   ├── VehicleModelRequest.java
    │   │   │   │   ├── VehicleTypeRequest.java
    │   │   │   │   ├── VehiclePrintTemplateRequest.java
    │   │   │   │   ├── VehiclePrintConfirmRequest.java
    │   │   │   │   └── DetectionRequest.java
    │   │   │   └── response/                         # Outbound response DTOs
    │   │   │       ├── ApiResponse.java              # Generic wrapper
    │   │   │       ├── AuthResponse.java             # JWT token response
    │   │   │       ├── LogUserResponse.java          # Logged-in user profile
    │   │   │       ├── UserResponse.java             # General user info
    │   │   │       ├── OwnerUserResponse.java        # Owner with vehicles
    │   │   │       ├── VehicleUserResponse.java      # User with vehicle docs
    │   │   │       ├── VehicleDocumentResponse.java  # Vehicle + documents
    │   │   │       ├── OwnerVehicleResponse.java     # Owner-scoped vehicle
    │   │   │       ├── DocumentResponse.java
    │   │   │       ├── DocumentTypeResponse.java
    │   │   │       ├── DetectionHistoryResponse.java # Detection + compliance result
    │   │   │       ├── EpcResponse.java              # Generated EPC tag
    │   │   │       ├── ReaderResponse.java
    │   │   │       ├── ReaderCommandResponse.java
    │   │   │       ├── RoleResponse.java
    │   │   │       ├── ScanCenterResponse.java
    │   │   │       ├── VehicleMakeResponse.java
    │   │   │       ├── VehicleModelResponse.java
    │   │   │       ├── VehicleResponse.java
    │   │   │       ├── VehicleTypeResponse.java
    │   │   │       ├── VehiclePrintHistoryResponse.java
    │   │   │       ├── VehiclePrintConfirmResponse.java
    │   │   │       └── VehiclePrintTemplateResponse.java
    │   │   │
    │   │   ├── entity/                               # JPA Entities (DB tables)
    │   │   │   ├── User.java                         # System users (owners, admins, operators)
    │   │   │   ├── Role.java                         # User roles
    │   │   │   ├── Vehicle.java                      # Registered vehicles
    │   │   │   ├── VehicleType.java                  # e.g. Car, Truck, Bike
    │   │   │   ├── VehicleModel.java                 # e.g. Corolla, Civic
    │   │   │   ├── VehicleMake.java                  # e.g. Toyota, Honda
    │   │   │   ├── Document.java                     # Vehicle documents (insurance, revenue etc.)
    │   │   │   ├── DocumentType.java                 # Document category types
    │   │   │   ├── Reader.java                       # RFID readers (Zebra FX9600)
    │   │   │   ├── ScanCenter.java                   # Physical scan/checkpoint locations
    │   │   │   ├── Location.java                     # Geographic location info
    │   │   │   ├── DetectionHistory.java             # RFID detection event log
    │   │   │   ├── VehicleSequence.java              # EPC serial number sequence tracker
    │   │   │   └── VehiclePrintHistory.java          # ZPL label print history
    │   │   │
    │   │   ├── exception/                            # Exception handling
    │   │   │   ├── GlobalExceptionHandler.java       # @ControllerAdvice handler
    │   │   │   ├── ResourceNotFoundException.java    # 404 not found
    │   │   │   └── UserAlreadyExistsException.java   # 409 conflict
    │   │   │
    │   │   ├── mqtt/                                 # MQTT integration
    │   │   │   ├── FX9600TagReadPayload.java         # Deserialized tag-read payload
    │   │   │   ├── MqttCommandPublisher.java         # Publishes commands to readers
    │   │   │   └── MqttDetectionListener.java        # Listens for tag-read events
    │   │   │
    │   │   ├── repository/                           # Spring Data JPA repositories
    │   │   │   (one per entity — UserRepository, VehicleRepository, etc.)
    │   │   │
    │   │   ├── security/                             # JWT & Spring Security
    │   │   │   ├── JwtTokenProvider.java             # Token generation & validation
    │   │   │   ├── JwtAuthenticationFilter.java      # Per-request JWT filter
    │   │   │   ├── JwtAuthenticationEntryPoint.java  # 401 response handler
    │   │   │   └── UserSecurity.java                 # Custom security expressions
    │   │   │
    │   │   └── service/                              # Business logic interfaces & implementations
    │   │       ├── IAuthService.java / AuthServiceImpl.java
    │   │       ├── IUserService.java / UserServiceImpl.java
    │   │       ├── IVehicleService.java / VehicleServiceImpl.java
    │   │       ├── IDocumentService.java / DocumentServiceImpl.java
    │   │       ├── IDocumentTypeService.java / DocumentTypeServiceImpl.java
    │   │       ├── IDetectionHistoryService.java / DetectionHistoryServiceImpl.java
    │   │       ├── IEmailService.java / EmailServiceImpl.java
    │   │       ├── IReaderService.java / ReaderServiceImpl.java
    │   │       ├── IRoleService.java / RoleServiceImpl.java
    │   │       ├── IScanCenterService.java / ScanCenterServiceImpl.java
    │   │       ├── ITokenBlacklistService.java / TokenBlacklistServiceImpl.java
    │   │       ├── IVehicleMakeService.java / VehicleMakeServiceImpl.java
    │   │       ├── IVehicleModelService.java / VehicleModelServiceImpl.java
    │   │       ├── IVehicleTypeService.java / VehicleTypeServiceImpl.java
    │   │       └── IVehiclePrintService.java / VehiclePrintServiceImpl.java
    │   │
    │   └── resources/
    │       ├── application.properties                # Production config
    │       ├── application-dev.properties            # Development config
    │       └── db/migration/                         # Flyway SQL migrations
    │           ├── V1__create_initial_schema.sql
    │           ├── V2__tables.sql
    │           ├── V3__alter_vehicle_next_serial_number.sql
    │           ├── V4__add_active_deleted_columns.sql
    │           ├── V5__alter_detection_history_and_document_type.sql
    │           ├── V6__add_compliance_message_to_detection_history.sql
    │           ├── V7__add_print_columns_and_vehicle_print_history.sql
    │           ├── V8__create_vehicle_sequence.sql
    │           └── V9__add_mqtt_fields_to_fix_reader.sql
    │
    └── test/
        └── java/com/example/compliance_service/
            └── ComplianceServiceApplicationTests.java
```

---

## 🗄 Database Schema

### Core Entities

| Table                  | Description                                              |
|------------------------|----------------------------------------------------------|
| `users`                | All system users (owners, admins, scan center operators) |
| `roles`                | User roles (ADMIN, OWNER, OPERATOR, etc.)               |
| `vehicles`             | Registered vehicles with EPC RFID tag                   |
| `vehicle_types`        | Vehicle category types (Car, Truck, Bike, etc.)         |
| `vehicle_makes`        | Manufacturer brands (Toyota, Honda, etc.)               |
| `vehicle_models`       | Specific models linked to makes                          |
| `documents`            | Vehicle compliance documents                             |
| `document_types`       | Document categories (Insurance, Revenue Licence, etc.)  |
| `readers`              | RFID reader devices (Zebra FX9600)                       |
| `scan_centers`         | Physical scan checkpoint locations                       |
| `locations`            | Geographic location data                                 |
| `detection_history`    | Log of every RFID tag detection event                    |
| `vehicle_sequence`     | Tracks EPC serial number sequence per vehicle type       |
| `vehicle_print_history`| History of ZPL label prints                             |

### Key Relationships

```
Role ──< User >── ScanCenter
                    │
User ──< Vehicle >──┘
           │
           └──< Document >── DocumentType
           │
           └── VehicleType
           └── VehicleModel >── VehicleMake

Reader >── ScanCenter
Reader ──< DetectionHistory >── Vehicle
```

### Compliance Status (EComplianceStatus)

| Status        | Meaning                                      |
|---------------|----------------------------------------------|
| `COMPLIANT`   | All documents valid and not near expiry       |
| `NEAR_EXPIRY` | One or more documents expiring within 30 days |
| `EXPIRED`     | One or more documents have expired            |
| `MISSING`     | One or more required documents are absent     |

---

## 📡 API Endpoints

> Base URL: `http://localhost:29288/autocomply`

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint        | Auth  | Description                  |
|--------|-----------------|-------|------------------------------|
| POST   | `/api/auth/login`   | ❌    | Login and receive JWT token   |
| POST   | `/api/auth/logout`  | ✅    | Invalidate current JWT token  |

### 👤 Users (`/api/users`)

| Method | Endpoint                              | Auth  | Description                             |
|--------|---------------------------------------|-------|-----------------------------------------|
| GET    | `/api/users`                          | ✅    | Get all users (filterable by params)    |
| GET    | `/api/users/me`                       | ✅    | Get logged-in user's full profile       |
| GET    | `/api/users/{id}`                     | ✅    | Get user by ID with vehicles/documents  |
| GET    | `/api/users/owners`                   | ✅    | Get all owner users with vehicles       |
| GET    | `/api/users/search?query=`            | ✅    | Search owners by name, NIC, vehicle no  |
| POST   | `/api/users`                          | ✅    | Create a new user                       |
| POST   | `/api/users/{id}/vehicles`            | ✅    | Add vehicle to owner                    |
| PUT    | `/api/users`                          | ✅    | Update user details                     |
| PUT    | `/api/users/vehicles/{vehicleId}`     | ✅    | Update owner's vehicle and documents    |
| PUT    | `/api/users/{id}/activate`            | ✅    | Activate user account                   |
| PUT    | `/api/users/{id}/deactivate`          | ✅    | Deactivate user account                 |
| DELETE | `/api/users/{id}`                     | ✅    | Hard delete user                        |
| DELETE | `/api/users/{id}/soft`                | ✅    | Soft delete user (mark deleted)         |
| DELETE | `/api/users/{userId}/vehicles/{vehicleId}` | ✅ | Remove vehicle from owner             |

### 🚗 Vehicles (`/api/vehicles`)

| Method | Endpoint                          | Auth  | Description                         |
|--------|-----------------------------------|-------|-------------------------------------|
| GET    | `/api/vehicles`                   | ✅    | Get all vehicles (filterable)       |
| GET    | `/api/vehicles/{id}`              | ✅    | Get vehicle by ID                   |
| POST   | `/api/vehicles`                   | ✅    | Create vehicle                      |
| PUT    | `/api/vehicles/{id}`              | ✅    | Update vehicle                      |
| DELETE | `/api/vehicles/{id}`              | ✅    | Delete vehicle                      |

### 📄 Documents (`/api/documents`)

| Method | Endpoint                          | Auth  | Description                         |
|--------|-----------------------------------|-------|-------------------------------------|
| GET    | `/api/documents`                  | ✅    | Get all documents (filterable)      |
| GET    | `/api/documents/{id}`             | ✅    | Get document by ID                  |
| POST   | `/api/documents`                  | ✅    | Create document                     |
| PUT    | `/api/documents/{id}`             | ✅    | Update document                     |
| DELETE | `/api/documents/{id}`             | ✅    | Delete document                     |

### 📋 Document Types (`/api/document-types`)

| Method | Endpoint                          | Auth  | Description                         |
|--------|-----------------------------------|-------|-------------------------------------|
| GET    | `/api/document-types`             | ✅    | Get all document types              |
| GET    | `/api/document-types/{id}`        | ✅    | Get document type by ID             |
| POST   | `/api/document-types`             | ✅    | Create document type                |
| PUT    | `/api/document-types/{id}`        | ✅    | Update document type                |
| DELETE | `/api/document-types/{id}`        | ✅    | Delete document type                |

### 📡 Readers (`/api/readers`)

| Method | Endpoint                             | Auth  | Description                          |
|--------|--------------------------------------|-------|--------------------------------------|
| GET    | `/api/readers`                       | ✅    | Get all RFID readers                 |
| GET    | `/api/readers/{id}`                  | ✅    | Get reader by ID                     |
| POST   | `/api/readers`                       | ✅    | Register a reader                    |
| PUT    | `/api/readers/{id}`                  | ✅    | Update reader                        |
| DELETE | `/api/readers/{id}`                  | ✅    | Delete reader                        |
| POST   | `/api/readers/{id}/command`          | ✅    | Send MQTT command to reader          |

### 🏢 Scan Centers (`/api/scan-centers`)

| Method | Endpoint                          | Auth  | Description                         |
|--------|-----------------------------------|-------|-------------------------------------|
| GET    | `/api/scan-centers`               | ✅    | Get all scan centers                |
| GET    | `/api/scan-centers/{id}`          | ✅    | Get scan center by ID               |
| POST   | `/api/scan-centers`               | ✅    | Create scan center                  |
| PUT    | `/api/scan-centers/{id}`          | ✅    | Update scan center                  |
| DELETE | `/api/scan-centers/{id}`          | ✅    | Delete scan center                  |

### 📊 Detection History (`/api/detections`)

| Method | Endpoint                          | Auth  | Description                              |
|--------|-----------------------------------|-------|------------------------------------------|
| GET    | `/api/detections`                 | ✅    | Get all detections (filterable/pageable) |
| GET    | `/api/detections/{id}`            | ✅    | Get detection by ID                      |
| POST   | `/api/detections`                 | ✅    | Manually log a detection event           |
| DELETE | `/api/detections/{id}`            | ✅    | Delete detection record                  |

### 🖨 Vehicle Print (`/api/vehicle-print`)

| Method | Endpoint                                   | Auth  | Description                        |
|--------|--------------------------------------------|-------|------------------------------------|
| POST   | `/api/vehicle-print/template`              | ✅    | Generate ZPL print template        |
| POST   | `/api/vehicle-print/confirm`               | ✅    | Confirm and save a print job       |
| GET    | `/api/vehicle-print/history`              | ✅    | Get print history                  |

### 🔧 Reference Data

| Resource        | Base Path              | Operations              |
|-----------------|------------------------|-------------------------|
| Roles           | `/api/roles`           | GET, POST, PUT, DELETE  |
| Vehicle Types   | `/api/vehicle-types`   | GET, POST, PUT, DELETE  |
| Vehicle Makes   | `/api/vehicle-makes`   | GET, POST, PUT, DELETE  |
| Vehicle Models  | `/api/vehicle-models`  | GET, POST, PUT, DELETE  |

---

## 🔒 Security

### JWT Authentication

- On login, a **JWT token** is returned in the response.
- All protected endpoints require the header:
  ```
  Authorization: Bearer <token>
  ```
- Token expiry defaults to **24 hours** (`86400000 ms`).
- Logout **blacklists** the token via `TokenBlacklistService` to prevent reuse.

### JWT Flow

```
Client → POST /api/auth/login → { token: "eyJ..." }
Client → GET  /api/users/me   → Authorization: Bearer eyJ...
                              → JwtAuthenticationFilter validates token
                              → SecurityContext populated
                              → Controller executes
```

### Password Security

- Passwords are hashed using **BCrypt** via Spring Security's `PasswordEncoder`.

---

## 📶 MQTT Integration

The service connects to an MQTT broker (HiveMQ or local Mosquitto) to receive real-time RFID tag-read events from **Zebra FX9600** readers.

### Flow

```
Zebra FX9600 Reader
      │  (publishes EPC tag reads)
      ▼
MQTT Broker (tcp://localhost:1883)
      │  Topic: rfid/fx9600/tag-reads
      ▼
MqttDetectionListener
      │  (deserializes FX9600TagReadPayload)
      ▼
DetectionHistoryService.processDetection()
      │
      ├── Lookup vehicle by EPC
      ├── Validate all documents (COMPLIANT / NEAR_EXPIRY / EXPIRED / MISSING)
      ├── Save DetectionHistory record
      └── Trigger email notifications (if needed)
```

### MQTT Configuration

| Property            | Default                        |
|---------------------|--------------------------------|
| Broker URL          | `tcp://localhost:1883`         |
| Client ID           | `compliance-service`           |
| Topic               | `rfid/fx9600/tag-reads`        |
| QoS                 | `1`                            |
| Reader Model        | `Zebra FX9600`                 |

### Command Publishing

The service can also **send commands back to readers** (e.g., start/stop reading) via `MqttCommandPublisher`.

---

## 📧 Email Notifications

Email notifications are triggered automatically during the **detection processing** when a vehicle's compliance status is evaluated.

### Notification Types

| Trigger Condition                          | Email Sent To                      | Content                                      |
|--------------------------------------------|------------------------------------|----------------------------------------------|
| Any document is `EXPIRED` or `MISSING`     | Vehicle owner + Scan center users  | List of expired/missing documents            |
| Any document is `NEAR_EXPIRY`              | Vehicle owner                      | List of near-expiry documents with end dates |

> ⚠️ Both emails are sent **independently** — if a vehicle has both expired AND near-expiry documents, **both emails** are sent to the relevant recipients.

### Email Configuration (Gmail SMTP)

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

## ⚙️ Configuration

### Profiles

| Profile | File                         | Use Case                         |
|---------|------------------------------|----------------------------------|
| `dev`   | `application-dev.properties` | Local development (verbose logs) |
| `prod`  | `application.properties`     | Production deployment            |

Switch active profile:
```properties
spring.profiles.active=dev
```

### Server

| Property                     | Default                    |
|------------------------------|----------------------------|
| `server.port`                | `29288`                    |
| `server.servlet.context-path`| `/autocomply`              |

---

## 🚀 Running the Application

### Prerequisites

- Java 21+
- PostgreSQL running on `localhost:5432`
- Database `rfid_compliance_db` created
- MQTT broker running on `localhost:1883` *(optional — app starts without it)*

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd compliance-service

# 2. Create the database
psql -U postgres -c "CREATE DATABASE rfid_compliance_db;"

# 3. Configure environment (or edit application-dev.properties)
# Set DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD

# 4. Run the application
./gradlew bootRun

# Or build and run the JAR
./gradlew build
java -jar build/libs/compliance-service-0.0.1-SNAPSHOT.jar
```

Flyway will automatically run all migrations in `db/migration/` on startup.

### Default Admin User

On first startup, `DataInitializer` seeds:
- Default **roles**: `ADMIN`, `OWNER`, `OPERATOR`
- A default **admin** user (check `DataInitializer.java` for credentials)

---

## 🌍 Environment Variables

| Variable                  | Description                          | Default                        |
|---------------------------|--------------------------------------|--------------------------------|
| `DATABASE_URL`            | PostgreSQL JDBC URL                  | `jdbc:postgresql://localhost:5432/rfid_compliance_db` |
| `DATABASE_USERNAME`       | Database username                    | `postgres`                     |
| `DATABASE_PASSWORD`       | Database password                    | `postgres`                     |
| `JWT_SECRET`              | Base64-encoded JWT signing secret    | *(default dev key — change!)*  |
| `JWT_EXPIRATION`          | Token expiry in milliseconds         | `86400000` (24 hrs)            |
| `SERVER_PORT`             | HTTP server port                     | `29288`                        |
| `MQTT_BROKER_URL`         | MQTT broker connection URL           | `tcp://localhost:1883`         |
| `MQTT_CLIENT_ID`          | MQTT client identifier               | `compliance-service`           |
| `MQTT_TOPIC`              | Topic to subscribe for tag reads     | `rfid/fx9600/tag-reads`        |
| `MQTT_QOS`                | MQTT Quality of Service level        | `1`                            |
| `MQTT_USERNAME`           | MQTT broker username                 | *(empty)*                      |
| `MQTT_PASSWORD`           | MQTT broker password                 | *(empty)*                      |
| `EMAIL_HOST`              | SMTP host                            | `smtp.gmail.com`               |
| `EMAIL_PORT`              | SMTP port                            | `587`                          |
| `EMAIL_USER`              | Email sender address                 | *(required)*                   |
| `EMAIL_APP_PASSWORD`      | Email app password                   | *(required)*                   |

---

## 📦 Key Features Summary

| Feature                        | Description                                                                 |
|--------------------------------|-----------------------------------------------------------------------------|
| **User Management**            | Full CRUD for users with roles, scan center assignment, soft delete         |
| **Vehicle Registration**       | Register vehicles with EPC RFID tag generation, type, model, make           |
| **Document Tracking**          | Track compliance documents (insurance, revenue licence, etc.) per vehicle   |
| **RFID Detection**             | Real-time EPC tag detection via MQTT from Zebra FX9600 readers              |
| **Compliance Validation**      | Auto-evaluate document status: COMPLIANT / NEAR_EXPIRY / EXPIRED / MISSING  |
| **Email Alerts**               | Automatic email notifications to owners & scan center staff                 |
| **Print Label Management**     | Generate & track ZPL label prints for RFID tags                             |
| **Scan Center Management**     | Manage physical scan checkpoint locations                                   |
| **JWT Security**               | Stateless JWT auth with token blacklisting on logout                        |
| **Database Migrations**        | Version-controlled schema via Flyway (9 migrations)                         |
| **Dynamic Filtering**          | JPA Specification-based dynamic query filtering across all list endpoints   |

---

## 📬 Postman Collection

A full Postman collection is included at the root of the project:

```
RFID_Compliance_Service.postman_collection.json
```

Import it into Postman to explore and test all API endpoints.

