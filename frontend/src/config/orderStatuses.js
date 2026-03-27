import { CheckCircle, XCircle, ChefHat, Package } from "lucide-react";

/**
 * Shared order status configuration used by both the customer
 * order-tracking page and the admin dashboard.
 *
 * `color`  — Tailwind classes for Badge background + text + border.
 *            Consumer can add `border-0` to suppress the border.
 * `step`   — Progress-tracker step number (0 = rejected / N/A).
 */
export const STATUS_CONFIG = {
  new: {
    label: "Order Placed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package,
    step: 1,
  },
  accepted: {
    label: "Accepted",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: CheckCircle,
    step: 2,
  },
  preparing: {
    label: "Preparing",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: ChefHat,
    step: 3,
  },
  ready: {
    label: "Ready",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    step: 4,
  },
  completed: {
    label: "Completed",
    color: "bg-stone-100 text-stone-600 border-stone-200",
    icon: CheckCircle,
    step: 5,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    step: 0,
  },
};

/** Valid next statuses an admin can transition an order to. */
export const NEXT_STATUS = {
  new: ["accepted", "rejected"],
  accepted: ["preparing"],
  preparing: ["ready"],
  ready: ["completed"],
};

/** Ordered step labels for the customer progress tracker. */
export const PROGRESS_STEPS = ["Placed", "Accepted", "Preparing", "Ready"];
