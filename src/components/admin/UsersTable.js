import React from 'react';
import { Card, Table, Spinner, Badge, Button, Dropdown } from 'react-bootstrap';

export default function UsersTable({
  users,
  loading,
  loadingUserUpdate,
  loadingDeleteUser,
  handleUpdateUser,
  handleToggleUserStatus,
  handleCancelSubscription,
  handleDeleteUser,
  renderUserSubscriptionBadge,
}) {
  return (
    <Card
      className="admin-panel-card admin-users-card shadow-sm border-0 mt-4"
    >
      <Card.Body className="p-4">
        <div className="admin-section-head d-flex justify-content-between align-items-center flex-wrap gap-3 mb-2">
          <div>
            <div className="admin-section-title-wrap">
              <span className="admin-section-title-icon" aria-hidden="true">
                <i className="bi bi-people-fill" />
              </span>
              <div>
                <div className="admin-kicker">Users & Permissions</div>
                <h5 className="mb-1 fw-bold">Manage Users</h5>
              </div>
            </div>
            <small className="text-muted">
              Change roles, activate / deactivate or delete accounts.
            </small>
          </div>
          <div className="admin-meta-chip">
            {users.length} accounts
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center my-4">
            <Spinner animation="border" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-muted mt-3">No users found.</p>
        ) : (
          <div className="table-responsive admin-users-table-wrap admin-table-shell mt-3">
            <Table hover size="sm" className="admin-table admin-users-premium-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Subscription</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="admin-user-row">
                    <td>
                      <div className="admin-user-identity">
                        <span className="admin-user-avatar" aria-hidden="true">
                          {(user.username || '?').trim().charAt(0).toUpperCase()}
                        </span>
                        <span className="admin-user-name">{user.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-user-email">{user.email}</span>
                    </td>
                    <td style={{ width: '140px' }}>
                      <Dropdown
                        className="glass-filter-dropdown admin-role-dropdown"
                      >
                        <Dropdown.Toggle
                          className={`glass-filter-toggle admin-input admin-role-toggle ${
                            user.role === 'admin' ? 'is-admin' : 'is-user'
                          }`}
                          variant="link"
                          disabled={loadingUserUpdate === user._id}
                        >
                          <span className="glass-filter-label">
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          renderOnMount
                          className="glass-filter-menu admin-role-menu"
                        >
                          <Dropdown.Item
                            active={user.role === 'user'}
                            onClick={() =>
                              handleUpdateUser(user._id, {
                                role: 'user',
                              })
                            }
                          >
                            User
                          </Dropdown.Item>
                          <Dropdown.Item
                            active={user.role === 'admin'}
                            onClick={() =>
                              handleUpdateUser(user._id, {
                                role: 'admin',
                              })
                            }
                          >
                            Admin
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                    <td>
                      <Badge
                        className={`admin-book-badge admin-user-status-badge ${
                          user.isActive ? 'is-active' : 'is-inactive'
                        }`}
                        bg={user.isActive ? 'success' : 'secondary'}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div className="admin-user-subscription">
                        {renderUserSubscriptionBadge(user)}
                      </div>
                    </td>
                    <td>
                      <span className="admin-user-date">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : '-'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-book-actions">
                      {user.role === 'user' && (
                        <Button
                          variant={user.isActive ? 'warning' : 'success'}
                          size="sm"
                          className={`admin-book-action ${
                            user.isActive
                              ? 'admin-user-action--toggle-off'
                              : 'admin-user-action--toggle-on'
                          }`}
                          onClick={() => handleToggleUserStatus(user)}
                          disabled={loadingUserUpdate === user._id}
                        >
                          <i
                            className={`bi ${
                              user.isActive ? 'bi-pause-circle' : 'bi-play-circle'
                            }`}
                            aria-hidden="true"
                          />
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}

                      {user.role === 'user' &&
                        user.subscription &&
                        user.subscription.plan &&
                        user.subscription.plan !== 'none' && (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="admin-book-action admin-user-action--subscription"
                            onClick={() => handleCancelSubscription(user._id)}
                            disabled={loadingUserUpdate === user._id}
                          >
                            <i className="bi bi-x-circle" aria-hidden="true" />
                            Cancel Subscription
                          </Button>
                        )}

                      <Button
                        variant="danger"
                        size="sm"
                        className="admin-book-action admin-book-action--delete"
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={loadingDeleteUser === user._id}
                      >
                        <i className="bi bi-trash3" aria-hidden="true" />
                        {loadingDeleteUser === user._id ? 'Deleting...' : 'Delete'}
                      </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
