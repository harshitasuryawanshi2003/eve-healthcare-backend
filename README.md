# EVE Healthcare - Backend Assignment

Backend service for diagnostic test bookings and simulated payments, developed for the EVE Healthcare SDE Intern Backend Engineering Assignment.

The application provides user authentication, diagnostic test and centre management, diagnostic test bookings, simulated payments, and an idempotent payment webhook.

---

## Features

- User signup and login
- JWT-based authentication
- HTTP-only cookie authentication
- Bearer token authentication
- Role-based authorization
- USER and ADMIN roles
- Diagnostic test management
- Diagnostic centre management
- Centre-specific test pricing
- Diagnostic test booking
- Booking status management
- Simulated payment processing
- SUCCESS and FAILED payment handling
- Payment webhook
- Webhook idempotency
- Duplicate payment protection
- Booking ownership validation
- Input validation
- Authorization checks
- Seed data for tests and diagnostic centres

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcrypt
- cookie-parser
- dotenv

---

# Project Structure

```text
EVE/
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── auth.js
│   ├── booking.js
│   ├── centre.js
│   ├── payment.js
│   └── test.js
│
├── middlewares/
│   └── auth.js
│
├── models/
│   ├── Booking.js
│   ├── DiagnosticCentre.js
│   ├── Payment.js
│   ├── Test.js
│   └── User.js
│
├── routes/
│   ├── booking.js
│   ├── centre.js
│   ├── payment.js
│   ├── test.js
│   └── user.js
│
├── scripts/
│   ├── createAdmin.js
│   └── seedData.js
│
│
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── package-lock.json

```

---

# Prerequisites

Make sure the following are installed:
- Node.js
- npm
- MongoDB
A MongoDB database/connection string is required to run the application.

---

# Installation

1. Clone the repository
```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd EVE
```

2. Install dependencies
```bash
   npm install
```

3. Create environment file

Create a .env file in the project root.
A .env.example file is included in the repository as a template.

# Running the Application

Development
```bash
   npm run dev 
```
Normal Start
```bash
   npm start
```
The server runs on:
```bash
   http://localhost:4000 
```

# Admin Setup

Admin accounts are not created through the public signup endpoint.
After configuring the .env file, run:
```bash
    npm run create-admin
```

The script uses:
```bash
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=change_this_password
```
to create the admin account.
If the admin already exists, the script does not create a duplicate account.

# Seed Data

The project contains a seed script for creating sample diagnostic tests and diagnostic centres.

Run:
```bash
    npm run seed
```

The seed script creates the data only when it does not already exist.

## Sample Diagnostic Tests
- Complete Blood Count
- Lipid Profile
- Thyroid Profile
- Liver Function Test

## Sample Diagnostic Centres
- City Diagnostic Centre
- Apollo Diagnostics
- HealthCare Diagnostics

# Authentication

The application uses JWT-based authentication.

A user can authenticate using either:
- HTTP-only authentication cookie
- Bearer token in the Authorization header

Example:
```bash
    Authorization: Bearer <JWT_TOKEN>
```

# Signup

Endpoint
```bash
    POST /api/v1/signup
```

Request Body
```bash
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123"
    }
```
New users are automatically assigned the USER role.
The client cannot select the role during signup.

Example Response
```bash
    {
        "success": true,
        "message": "User registered successfully",
        "user": {
            "id": "USER_ID",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "USER"
         }
    }
```
# Login

Endpoint
```bash
    POST /api/v1/login
```

Request Body
```bash
    {
        "email": "john@example.com",
        "password": "password123"
    }
```

Example Response
```bash
    {
        "success": true,
        "message": "Login successful",
        "token": "<JWT_TOKEN>",
        "user": {
            "id": "USER_ID",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "USER"
        }
    }
```
The server also sets the JWT in an HTTP-only cookie.

# Authorization and Roles

The application supports two roles:
```bash
    USER
    ADMIN
```

# USER
A normal user can:
- View diagnostic tests
- View diagnostic centres
- Create bookings
- View their own bookings
- View individual bookings belonging to them
- Cancel pending bookings
- Make payments

# ADMIN
An administrator can:
- Create diagnostic tests
- Update diagnostic tests
- Delete diagnostic tests
- Create diagnostic centres
- Update diagnostic centres
- Delete diagnostic centres

Public signup always creates a USER.

---

# Diagnostic Tests API

## Get All Tests
```bash
    GET /api/v1/tests
```
No authentication is required.

## Get Test by ID
```bash
   GET /api/v1/tests/:id
```

Example:
```bash
    GET /api/v1/tests/TEST_ID
```

## Create Test
Admin authentication required.
```bash
    POST /api/v1/tests
```

Request Body
```bash
    {
        "name": "Vitamin D Test",
        "description": "Measures vitamin D levels in the blood"
    }
```

## Update Test
Admin authentication required.
```bash
    PATCH /api/v1/tests/:id
```

Request Body
```bash
    {
        "name": "Updated Vitamin D Test",
        "description": "Updated description"
    }
```

## Delete Test
Admin authentication required.
```bash
    DELETE /api/v1/tests/:id
```

A test cannot be deleted if it is currently offered by a diagnostic centre.

# Diagnostic Centre API

## Get All Centres
```bash
    GET /api/v1/centres
```

No authentication is required.

## Get Centre by ID
```bash
    GET /api/v1/centres/:id
```

## Create Centre
Admin authentication required.
```bash
    POST /api/v1/centres
```

Request Body
```bash
    {
        "name": "City Diagnostic Centre",
        "location": "Bhopal, Madhya Pradesh",
        "tests": [
            {
            "testId": "TEST_ID",
            "price": 500
            },
            {
            "testId": "ANOTHER_TEST_ID",
            "price": 800
            }
        ]
    }
```

The price is stored at the diagnostic-centre level.
This allows the same diagnostic test to have different prices at different centres.

## Update Centre
Admin authentication required.
```bash
    PATCH /api/v1/centres/:id
```

The endpoint supports updating:
- Centre name
- Centre location
- Tests and their prices

## Delete Centre
Admin authentication required.
```bash
    DELETE /api/v1/centres/:id
```

# Booking API
Bookings can only be created by authenticated users.

## Create Booking
```bash
    POST /api/v1/bookings
```

Authorization
```bash
    Authorization: Bearer <USER_TOKEN>
```
Request Body
```bash
    {
        "testId": "TEST_ID",
        "centreId": "CENTRE_ID",
        "appointmentDate": "2026-10-15T10:00:00.000Z"
    }
```

The backend:
1. Validates the test ID.
2. Validates the centre ID.
3. Checks that the test exists.
4. Checks that the diagnostic centre exists.
5. Checks that the centre offers the selected test.
6. Gets the centre-specific test price.
7. Creates the booking with PENDING status.
The amount is determined by the selected centre rather than being accepted directly from the client.

## Get My Bookings
```bash
    GET /api/v1/bookings
```

Returns bookings belonging to the authenticated user.

## Get Booking by ID
```bash
    GET /api/v1/bookings/:id
```

A user can only access their own booking.

## Cancel Booking
```bash
    PATCH /api/v1/bookings/:id/cancel
```

Only pending bookings can be cancelled.

## Booking Status
The application supports four booking states:
- PENDING
- CONFIRMED
- FAILED
- CANCELLED

Typical booking flow:
                 ┌───────────────┐
                 │    PENDING    │
                 └───────┬───────┘
                         │
              ┌──────────┴──────────┐
              │                     │
          SUCCESS                 FAILED
              │                     │
              ▼                     ▼
       ┌─────────────┐       ┌─────────────┐
       │  CONFIRMED  │       │    FAILED   │
       └─────────────┘       └─────────────┘

A pending booking can also be cancelled:

PENDING
   │
   │ Cancel
   ▼
CANCELLED

# Simulated Payment API

No real payment gateway is integrated.
The payment endpoint simulates the result of payment processing.

## Process Payment
```bash
    POST /api/v1/payments
```

Authentication is required.

Request Body
```bash   
    {
        "bookingId": "BOOKING_ID",
        "paymentStatus": "SUCCESS"
    }
```

paymentStatus must be either:
```bash
    SUCCESS
```
or:
```bash
    FAILED
```

## Successful Payment Flow

Booking
   │
   │ PENDING
   ▼
POST /api/v1/payments
   │
   │ SUCCESS
   ▼
Payment created
   │
   ▼
Booking = CONFIRMED

## Failed Payment Flow

Booking
   │
   │ PENDING
   ▼
POST /api/v1/payments
   │
   │ FAILED
   ▼
Payment created
   │
   ▼
Booking = FAILED

Only pending bookings can be paid for.
Each booking can have at most one payment.

# Payment Webhook

The webhook represents a notification sent by a simulated payment provider to the backend.
Endpoint
```bash
    POST /api/v1/payments/webhook
```

The webhook does not require a JWT because it represents a server-to-server notification from the simulated payment provider.

Request Body
```bash
    {
        "eventId": "event_001",
        "bookingId": "BOOKING_ID",
        "paymentStatus": "SUCCESS"
    }
```

# Payment vs Webhook

The project contains both a simulated payment endpoint and a webhook because they represent two different parts of a payment flow.

## Simulated Payment
Client
   │
   │ POST /payments
   ▼
Backend
   │
   │ Simulated payment result
   ▼
Payment + Booking updated

## Webhook
Simulated Payment Provider
            │
            │ Payment event
            ▼
     /payments/webhook
            │
            ▼
         Backend
            │
            ▼
    Payment + Booking updated

The /payments endpoint simulates the payment processing operation.
The /payments/webhook endpoint simulates the payment provider notifying the backend about the payment result.

# Webhook Idempotency

Payment providers may retry webhook events.
For example:

Payment Provider
       │
       │ event_001
       ▼
    Backend
       │
       │ Process
       ▼
 Payment created

If the provider sends the same event again:

Payment Provider
       │
       │ event_001
       ▼
    Backend
       │
       │ Already processed
       ▼
No duplicate payment

The Payment model contains a unique webhookEventId.
The booking field in the Payment model is also unique.
Therefore:
1. The same webhook event cannot create another payment.
2. A booking cannot have multiple payment records.

# Database / Schema Design

The project uses MongoDB with Mongoose.
User

User
├── name
├── email
├── password
└── role

Roles:

USER
ADMIN

Passwords are hashed using bcrypt before being stored.

Test
Test
├── name
└── description

Diagnostic Centre
DiagnosticCentre
├── name
├── location
└── tests[]
      ├── testId
      └── price

The centre stores references to tests along with centre-specific prices.
This allows:
Centre A → CBC → ₹500
Centre B → CBC → ₹550

while still referencing the same diagnostic test.

Booking
Booking
├── user
├── test
├── centre
├── appointmentDate
├── amount
└── status

Relationships:
User ────────────────> Booking
Test ────────────────> Booking
DiagnosticCentre ────> Booking

The booking stores the final amount determined by the selected centre.

Payment
Payment
├── booking
├── user
├── amount
├── status
├── transactionId
└── webhookEventId

Important constraints:
- booking is unique
- transactionId is unique
- webhookEventId is unique when present
These constraints help prevent duplicate payment records and support webhook idempotency.

# Validation and Edge Cases

The backend handles cases including:
- Missing required fields
- Invalid MongoDB ObjectIds
- Invalid appointment dates
- Past appointment dates
- Non-existent tests
- Non-existent diagnostic centres
- Tests unavailable at a selected centre
- Duplicate user registration
- Invalid login credentials
- Missing authentication token
- Invalid JWT
- Expired JWT
- Unauthorized resource access
- Payment for non-pending bookings
- Duplicate payments
- Invalid payment status
- Invalid booking IDs
- Repeated webhook events
- Deleting a test currently used by a diagnostic centre


# NPM Scripts

Start server
```bash
    npm start
```

Development server
```bash
    npm run dev
```

Create admin
```bash
    npm run create-admin
```

Seed database
```bash
    npm run seed
```


# Important Assumptions

1. MongoDB is used instead of PostgreSQL because MongoDB/Mongoose is the database stack used for this implementation.
2. Diagnostic tests and diagnostic centres use mock/seed data. No external healthcare or diagnostic-centre API is integrated.
3. No real payment gateway is integrated because the assignment specifically requires simulated payments.
4. The /payments endpoint represents the simulated payment-processing operation.
5. The /payments/webhook endpoint represents a notification from a simulated payment provider.
6. Webhook signature verification is not implemented because the payment provider is simulated.
7. Each booking can have at most one payment.
8. Appointment slot conflict detection is outside the current scope.
9. Admin accounts are created separately using the create-admin script rather than through public signup.
10. Payment processing uses MongoDB operations and unique constraints rather than database transactions because the MongoDB deployment used during development does not support transactions.


# Future Improvements

If more development time were available, the following improvements could be added:
- Add comprehensive unit and integration tests for authentication, booking, payment, and webhook flows.
- Integrate a real payment gateway instead of simulated payment processing.
- Add webhook signature verification for secure payment-provider communication.
- Add appointment slot management to prevent conflicting bookings.
- Add pagination and filtering for diagnostic tests, centres, and bookings.
