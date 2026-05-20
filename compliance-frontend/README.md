# RFID Compliance Frontend (AutoComply)

Frontend application for RFID-based vehicle compliance management.
Built with React + Vite, this app supports authentication, role-based access, owner and vehicle management, document and compliance tracking, scan center operations, detections, and Zebra label printing workflows.

## Table of Contents

1. Project Overview
2. Technology Stack
3. Features
4. Project Structure
5. API Layer and Functions
6. Authentication and Authorization
7. Notifications and Error Handling
8. Environment Configuration
9. Getting Started
10. Build and Deployment
11. Troubleshooting

## Project Overview

This project is a single-page administration and operations dashboard for RFID compliance.

Main capabilities:

- User login/logout and session persistence
- Role-based page access and action control
- Dashboard with compliance summaries and live detection information
- CRUD and status management for users, owners, scan centers, document types, vehicle types/makes/models
- Vehicle search by registration/owner details
- Vehicle print template retrieval and print confirmation
- Zebra Browser Print integration for direct label printing
- Unified global API success/error popup notifications

## Technology Stack

### Core

- React 18
- Vite 5
- JavaScript (ES Modules)

### UI and Styling

- Tailwind CSS 3
- PostCSS + Autoprefixer
- Lucide React icons

### Data and HTTP

- Axios

### Forms and Validation

- Formik
- Yup

### Charts

- Recharts

### Tooling

- ESLint
- @vitejs/plugin-react

## Features

### Authentication

- Login with token storage in localStorage
- Automatic Bearer token injection for API requests
- Auto-logout and redirect on unauthorized responses

### Role-Based Access Control

- Centralized role and permission definitions
- Separate `view` and `manage` permissions per page
- Access guards in page rendering and navigation

### Account Management

- Profile details loaded from `/users/me`
- Editable contact number
- Optional password update
- Displays role and scan center details from profile payload

### Admin and Master Data

- Admin Users management
- Document Types management
- Vehicle Types, Makes, and Models management
- Scan Centers and Readers management

### Operations

- Detection history listing and filtering
- Dashboard compliance metrics and alert views
- Vehicle search by multiple criteria

### Printing

- Zebra Browser Print service URL management
- Printer discovery and default printer persistence
- Test print and production template printing flows

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- postcss.config.js
|-- README.md
|-- RFID_Compliance_Service.postman_collection.json
|-- tailwind.config.js
|-- vite.config.js
|-- public/
`-- src/
		|-- App.jsx
		|-- index.css
		|-- index.jsx
		|-- api/
		|   |-- apiAdapter.js
		|   |-- authApi.js
		|   |-- detectionsApi.js
		|   |-- documentTypesApi.js
		|   |-- scanCentersApi.js
		|   |-- usersApi.js
		|   |-- vehicleMakesApi.js
		|   |-- vehicleModelsApi.js
		|   |-- vehiclePrintsApi.js
		|   |-- vehicleSearchApi.js
		|   `-- vehicleTypesApi.js
		|-- components/
		|   |-- Dashboard/
		|   |   |-- ComplianceAlerts.jsx
		|   |   |-- LiveDetectionFeed.jsx
		|   |   `-- StatCard.jsx
		|   |-- Data/
		|   |   `-- Permissions.js
		|   |-- Layout/
		|   |   |-- Sidebar.jsx
		|   |   `-- TopBar.jsx
		|   `-- Shared/
		|       |-- ApiResponsePopup.jsx
		|       `-- DataTable.jsx
		|-- pages/
		|   |-- Account.jsx
		|   |-- AdminUsers.jsx
		|   |-- Dashboard.jsx
		|   |-- DetectionHistory.jsx
		|   |-- DocumentTypes.jsx
		|   |-- Login.jsx
		|   |-- PrinterSettings.jsx
		|   |-- ScanCenters.jsx
		|   |-- Settings.jsx
		|   |-- VehicleMakes.jsx
		|   |-- VehicleModels.jsx
		|   |-- VehiclePrint.jsx
		|   |-- VehicleSearch.jsx
		|   |-- VehicleTypes.jsx
		|   `-- Owners/
		|       |-- Owners.jsx
		|       |-- OwnerVehiclesPage.jsx
		|       |-- model/
		|       |   |-- OwnerFormModal.jsx
		|       |   `-- VehicleDocumentsModal.jsx
		|       `-- schema/
		|           `-- ownerFormSchema.js
		`-- utils/
				|-- responseNotifier.js
				`-- zebraPrint.js
```

## API Layer and Functions

All backend calls are centralized under `src/api`.

### `src/api/apiAdapter.js`

Core request wrapper and shared behavior:

- `request(url, method, data?, params?, headers?)`
- HTTP method constants: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- `clearAuthData()`

Responsibilities:

- Adds `Authorization: Bearer <token>` from localStorage
- Adds client timezone header
- Handles API/validation/network errors
- Triggers global response notifications
- Redirects to login on unauthorized responses

### `src/api/authApi.js`

- `loginUser(username, password)`
- `logoutUser()`
- `isAuthenticated()`
- `getUserProfile()`

### `src/api/usersApi.js`

- `getUsers()`
- `getCurrentUser()`
- `createUser(userData)`
- `updateUser(userData)`
- `deleteUser(userId)`
- `softDeleteUser(userId)`
- `updateUserStatus(userId, active)`
- `getUserById(userId)`
- `addVehicleToOwner(ownerId, vehicleData)`
- `updateVehicleForOwner(vehicleId, vehicleData)`
- `removeVehicleFromOwner(userId, vehicleId)`
- `getUsersByRole(roleName)`
- `getRoles()`

### `src/api/scanCentersApi.js`

- `getScanCenters()`
- `createScanCenter(payload)`
- `updateScanCenter(id, payload)`
- `deleteScanCenter(id)`
- `updateScanCenterStatus(id, active)`
- `getScanCenter(id)`
- `createReader(scanCenterId, payload)`
- `updateReader(scanCenterId, readerId, payload)`
- `deleteReader(scanCenterId, readerId)`

### `src/api/documentTypesApi.js`

- `getDocumentTypes()`
- `createDocumentType(documentType)`
- `updateDocumentType(id, documentType)`
- `deleteDocumentType(id)`
- `updateDocumentTypeStatus(id, active)`

### `src/api/vehicleTypesApi.js`

- `getVehicleTypes()`
- `createVehicleType(vehicleTypeData)`
- `updateVehicleType(id, vehicleTypeData)`
- `deleteVehicleType(id)`
- `updateVehicleTypeStatus(id, active)`

### `src/api/vehicleMakesApi.js`

- `getVehicleMakes()`
- `getVehicleMakeById(id)`
- `createVehicleMake(data)`
- `updateVehicleMake(id, data)`
- `deleteVehicleMake(id)`
- `updateVehicleMakeStatus(id, active)`

### `src/api/vehicleModelsApi.js`

- `getVehicleModels()`
- `getVehicleModelsByMakeId(makeId)`
- `getVehicleModelById(id)`
- `createVehicleModel(data)`
- `updateVehicleModel(id, data)`
- `deleteVehicleModel(id)`
- `updateVehicleModelStatus(id, active)`

### `src/api/detectionsApi.js`

- `getDetections({ scanCenterId?, status?, readerId? })`

### `src/api/vehicleSearchApi.js`

- `searchVehicles(query)`

### `src/api/vehiclePrintsApi.js`

- `getVehiclePrintTemplates(registrationNumbers)`
- `confirmVehiclePrint(vehicleNumber, epc)`

## Authentication and Authorization

### Session Storage

- `token` stored in localStorage
- `user` profile object stored in localStorage

### Role/Permission Definitions

Located in `src/components/Data/Permissions.js`.

Exports:

- `ROLES`
- `PAGES`
- `permissions`
- `canView(role, page)`
- `canManage(role, page)`
- `getAllowedPages(role)`
- `getUserRole()`

## Notifications and Error Handling

### Global Response Notifications

- `src/utils/responseNotifier.js`:
  - `notifyResponse(payload)`
  - `subscribeToResponseNotifications(listener)`

`App.jsx` subscribes and renders `ApiResponsePopup` globally.

### API Adapter Behavior

- Non-GET success messages are shown as global success popups
- Backend/API validation errors are shown as global error popups
- Network failures show connectivity guidance

## Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_ENDPOINT=/autocomply/api
```

Notes:

- Vite dev server proxy in `vite.config.js` routes `/autocomply` to `http://localhost:29289`.
- With the example above, requests resolve in development to `http://localhost:29289/autocomply/api/...`.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

## Build and Deployment

### Production Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

The build output is generated in the `dist/` directory.

## Troubleshooting

### App redirects to login unexpectedly

- Check token validity and API auth behavior
- Unauthorized responses trigger local session clear + redirect

### API calls fail in development

- Ensure backend is running on `http://localhost:29289`
- Verify `VITE_API_ENDPOINT` value
- Confirm proxy route starts with `/autocomply`

### Printer list is empty

- Install and run Zebra Browser Print locally
- Verify Browser Print URL in Printer Settings page (default `http://localhost:9100`)
- Check local firewall/permission prompts

### Icons/fonts/styles not loading

- Reinstall dependencies and rerun dev server
- Verify Tailwind/PostCSS config files are intact
