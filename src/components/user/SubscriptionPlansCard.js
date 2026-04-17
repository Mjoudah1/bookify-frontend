import React, { useMemo, useState } from 'react';
import { Card, Badge, Button, Alert } from 'react-bootstrap';
import { getToken } from '../../utils/auth';
import VirtualVisaPaymentModal from './VirtualVisaPaymentModal';
import { API_BASE_URL } from '../../utils/api';

const PLANS = [
  { key: 'monthly', label: '1 Month', price: 3, months: 1 },
  { key: 'quarterly', label: '3 Months', price: 5, months: 3 },
  { key: 'semiannual', label: '6 Months', price: 10, months: 6 },
  { key: 'yearly', label: '12 Months', price: 20, months: 12 },
];

const PLAN_LABELS = PLANS.reduce((acc, plan) => {
  acc[plan.key] = plan.label;
  return acc;
}, {});

export default function SubscriptionPlansCard({
  currentUser,
  onSubscriptionUpdated,
}) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const subscription = currentUser?.subscription || {};
  const isSubscribed = !!currentUser?.isSubscribed;
  const subscriptionState = useMemo(() => {
    const expiresAt = subscription.expiresAt
      ? new Date(subscription.expiresAt)
      : null;

    if (!subscription.plan || subscription.plan === 'none' || !expiresAt) {
      return {
        key: 'inactive',
        label: 'Inactive',
      };
    }

    if (Number.isNaN(expiresAt.getTime())) {
      return {
        key: 'inactive',
        label: 'Inactive',
      };
    }

    const now = new Date();
    if (!isSubscribed || expiresAt <= now) {
      return {
        key: 'expired',
        label: 'Expired',
      };
    }

    const warningWindowMs = 3 * 24 * 60 * 60 * 1000;
    if (expiresAt.getTime() - now.getTime() <= warningWindowMs) {
      return {
        key: 'ending-soon',
        label: 'Ending soon',
      };
    }

    return {
      key: 'active',
      label: 'Active',
    };
  }, [subscription, isSubscribed]);

  const statusText = useMemo(() => {
    if (!subscription.plan || subscription.plan === 'none') {
      return 'No active subscription yet.';
    }

    const expiresAt = subscription.expiresAt
      ? new Date(subscription.expiresAt)
      : null;

    if (
      expiresAt &&
      !Number.isNaN(expiresAt.getTime()) &&
      expiresAt > new Date() &&
      isSubscribed
    ) {
      const dateLabel = expiresAt.toLocaleDateString();
      if (subscriptionState.key === 'ending-soon') {
        return `Ends on ${dateLabel}. Renew soon to avoid interruption.`;
      }
      return `Active until ${dateLabel}.`;
    }

    return 'Subscription exists but is no longer active.';
  }, [subscription, isSubscribed, subscriptionState.key]);

  const openPlanCheckout = (plan) => {
    setError('');
    setSuccess('');
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePurchase = async (payment) => {
    const token = getToken();
    if (!token || !selectedPlan) return;

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_BASE_URL}/api/transactions/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan.key,
          payment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Subscription payment failed.');
      }

      setSuccess(data.message || 'Subscription activated successfully.');
      setShowPayment(false);
      setSelectedPlan(null);

      if (typeof onSubscriptionUpdated === 'function') {
        await onSubscriptionUpdated();
      }
    } catch (err) {
      setError(err.message || 'Subscription payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="subscription-plans-card border-0 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
            <div>
              <div className="subscription-title-row">
                <span className="subscription-title-icon" aria-hidden="true">
                  <i className="bi bi-credit-card-2-front-fill" />
                </span>
                <div>
                  <div className="subscription-kicker">Subscription Plans</div>
                  <h5 className="mb-1 fw-bold">Virtual Visa Checkout</h5>
                </div>
              </div>
              <p className="text-muted mb-0">
                Choose a plan, pay with a test Visa card, and unlock subscription books instantly.
              </p>
            </div>

            <div className="subscription-status-box">
              <Badge
                className={`subscription-status-badge is-${subscriptionState.key}`}
                bg="secondary"
                pill
              >
                {subscriptionState.label}
              </Badge>
              <div className="small text-muted mt-2 subscription-status-plan">
                {subscription.plan && subscription.plan !== 'none'
                  ? PLAN_LABELS[subscription.plan] || subscription.plan
                  : 'No plan'}
              </div>
              <div className="small mt-1 subscription-status-text">{statusText}</div>
            </div>
          </div>

          {error && !showPayment && (
            <Alert variant="danger" className="app-error-alert py-2">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="py-2">
              {success}
            </Alert>
          )}

          <div className="subscription-plan-grid">
            {PLANS.map((plan) => (
              <div className="subscription-plan-item" key={plan.key}>
                <div className="subscription-plan-badge">
                  {plan.months} {plan.months === 1 ? 'month' : 'months'}
                </div>
                <div className="subscription-plan-top">
                  <div>
                    <div className="subscription-plan-title">{plan.label}</div>
                    <div className="subscription-plan-meta">
                      {plan.months} {plan.months === 1 ? 'month' : 'months'} access
                    </div>
                  </div>
                  <div className="subscription-plan-price">${plan.price}</div>
                </div>

                <Button
                  variant="primary"
                  className="w-100 mt-3 subscription-plan-btn"
                  onClick={() => openPlanCheckout(plan)}
                >
                  <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
                  {isSubscribed ? 'Renew or Extend' : 'Subscribe Now'}
                </Button>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <VirtualVisaPaymentModal
        show={showPayment}
        onHide={() => {
          if (!loading) {
            setShowPayment(false);
            setSelectedPlan(null);
          }
        }}
        title={selectedPlan ? `${selectedPlan.label} Subscription` : 'Subscription'}
        subtitle="Use any virtual Visa test card to simulate payment."
        amountLabel={selectedPlan ? `$${selectedPlan.price.toFixed(2)}` : '$0.00'}
        submitLabel="Pay and Activate"
        loading={loading}
        error={showPayment ? error : ''}
        onSubmit={handlePurchase}
      />
    </>
  );
}
