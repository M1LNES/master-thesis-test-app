# US-01
## Name
User Registration & Onboarding Flow

## Description
As a new user, I want to securely register an account and subsequently log in with my new credentials.

## Acceptance Criteria
- **AC_01 (Navigation):** The registration form must be accessible via the "Register" link on the default login view.
- **AC_02 (Validation):** The system must prevent registration if the 'Password' and 'Confirm Password' fields do not match, displaying an appropriate validation warning.
- **AC_03 (Success):** Providing valid details with matching passwords successfully creates the account and automatically redirects the user back to the login page.
- **AC_04 (Persistence):** The newly registered credentials must be immediately valid for authenticating into the dashboard.

## Specification
Start the test at the base URL (`/`) and let the application automatically handle unauthenticated routing.

# US-02
## Name
Login Validation and Error Handling

## Description
As a user, I must be prevented from logging in with invalid credentials and receive appropriate feedback.

## Acceptance Criteria
- **AC_01 (Initial State):** Upon accessing the application unauthenticated, the user is presented with the login interface where input fields must be empty by default.
- **AC_02 (Empty Submission):** Attempting to submit the login form without providing both an email and a password must be blocked by local validation warnings.
- **AC_03 (Invalid Credentials):** Submitting the form with an incorrect email or password must trigger a clearly visible "Invalid credentials" error message.

## Specification
Start at the base URL (`/`). Rely on dynamic locators and automatic waiting rather than hardcoded timeouts.

# US-03
## Name
Role-Based Navigation Visibility

## Description
As a system administrator, I want to access privileged settings, while as a regular user, I must be strictly prevented from seeing or accessing administrative navigation links.

## Acceptance Criteria
- **AC_01 (Admin Access):** The system must render the 'System Settings' navigation tab in the header when authenticated as an administrator (`admin@test.com`).
- **AC_02 (User Restriction):** The system must strictly omit the 'System Settings' tab from the DOM when authenticated as a standard user (`user@test.com`), preventing unauthorized discovery.
- **AC_03 (Session Boundary):** The system must correctly isolate sessions; logging out and logging back in as a different role must immediately reflect that role's navigation permissions.

## Specification
The standard password for all test accounts is `password123`. Verification of AC_02 must ensure the element is physically absent from the DOM, not merely visually hidden.

# US-04
## Name
Create New Task and Verify Notification

## Description
As a logged-in user, I want to create a new task and see a clear visual confirmation.

## Acceptance Criteria
1. Start at the base URL and log in using `user@test.com` and `password123`.
2. Click the 'New Task' button to open the creation modal.
3. Leave the Title field completely empty and click 'Save'.
4. Verify that the form submission is prevented due to a required field validation.
5. Fill the Title field with "Test Task" and select a Priority.
6. Click 'Save' and verify that the modal automatically closes.
7. Verify that the newly created "Test Task" is visible in the dashboard task list.
8. Verify that a success Toast notification appears on the screen.

## Specification
Use strict text selectors where possible.

# US-05
## Name
Task Status Toggle and Filtering

## Description
As a user, I want to mark tasks as completed and use filters to quickly find active tasks.

## Acceptance Criteria
1. Log in using `user@test.com` and `password123`.
2. Locate an active task in the list and click its status checkbox.
3. Verify that the checkbox reflects the checked state (marked as completed).
4. Click the 'Active' filter button/radio.
5. Verify that the task you just marked as completed is no longer visible in the task list.
6. Click the 'Completed' filter button/radio.
7. Verify that the completed task is now visible in the list again.

## Specification
Ensure you wait for the list to update after clicking the filters before making assertions.

# US-06
## Name
Edit Task details via Modal

## Description
As a user, I want to update existing tasks without navigating away from the dashboard.

## Acceptance Criteria
1. Log in using `user@test.com` and `password123`.
2. Click the 'Edit' button on an existing task in the list.
3. Verify that the edit modal opens and the input fields are pre-populated with the task's current data.
4. Change the value in the 'Priority' field to a different option.
5. Click the 'Save' button.
6. Verify that the edit modal closes automatically.
7. Verify that the task in the dashboard list now displays the updated Priority.

## Specification
N/A

# US-07
## Name
Role-Based Task Deletion Permissions

## Description
As a system administrator, I can manage all tasks. As a user, I must not be able to delete tasks belonging to others to ensure data integrity.

## Acceptance Criteria
- **AC_01 (Admin Access):** - **Given** I am successfully logged in as an administrator (`admin@test.com`), 
  - **When** I view the dashboard task list, 
  - **Then** I should see the 'Delete' button on all tasks regardless of their owner.
- **AC_02 (User Restriction):** - **Given** I am successfully logged in as a standard user (`user@test.com`), 
  - **When** I view the dashboard task list, 
  - **Then** I should only see the 'Delete' button on tasks owned by me, 
  - **And** I should strictly NOT see the 'Delete' button on tasks owned by the administrator.

## Specification
The standard password for all test accounts is `password123`. Ensure the absence of the delete button is verified at the DOM level.

# US-08
## Name
Task Deletion Confirmation Flow

## Description
As a user, I want to delete my task but be prompted for confirmation first to prevent accidental data loss.

## Acceptance Criteria
- **AC_01 (Confirmation Prompt):** - **Given** I am logged in as `user@test.com` and have an existing task, 
  - **When** I click the 'Delete' button on my task, 
  - **Then** the system must display a confirmation dialog before proceeding.
- **AC_02 (Successful Deletion):** - **Given** the deletion confirmation dialog is visible, 
  - **When** I accept/confirm the deletion, 
  - **Then** the task must be permanently removed from the dashboard list, 
  - **And** a success Toast notification must be displayed to confirm the action.

## Specification
Use standard auto-waiting to verify the Toast notification. The password is `password123`.