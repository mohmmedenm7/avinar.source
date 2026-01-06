# Training Centers Frontend Integration

## Completed Tasks
1.  **Type Definitions**:
    - Created `src/types/trainingCenter.ts` defining `TrainingCenter` interface and data types for Create/Update.
    - Updated `User` interface to include new roles: `platform-manager`, `training-center-manager`, `facilitator`.

2.  **Service Layer**:
    - Created `src/services/trainingCenterService.ts` to handle API communication with the backend.
    - Implemented methods: `getAll`, `getById`, `create`, `update`, `delete`.

3.  **UI Component**:
    - Created `src/components/admin/TrainingCentersComponent.tsx`.
    - **Features**:
        - List all training centers with status (Active/Inactive).
        - Display Manager, Facilitator, Address, and Contact Info.
        - **Create Modal**: Form to add new center with dropdowns for Manager and Facilitator (filtered by role).
        - **Edit Modal**: Form to update existing center details.
        - Delete confirmation.

4.  **Dashboard Integration**:
    - Updated `src/pages/dashboard/AdminDashboard.tsx`.
    - Added "Training Centers" item to the sidebar menu.
    - Configured conditional rendering to show the `TrainingCentersComponent` when the tab is selected.

## How to Verify
1.  **Login as Admin**: Use an account with `admin` role.
2.  **Navigate to Dashboard**: Go to `/AdminDashboard` (or similar route depending on your routing, usually accessible after login).
3.  **Check Sidebar**: Look for the "Training Centers" (Building icon) in the sidebar menu.
4.  **Manage Centers**:
    - Click "Add Center" to open the form.
    - Verify that Manager/Facilitator dropdowns show users with appropriate roles (you might need to create users with `manager`, `facilitator`, etc. roles first via Users section or API).
    - Create a center and verify it appears in the list.
    - Edit and Delete a center to ensure full CRUD functionality.
