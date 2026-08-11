import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { AppLayout } from "./components/layout/AppLayout";
import {
  CreateQueue,
  QueueList,
} from "./components/queues/QueueList";
import { QueueDetail } from "./components/queues/QueueDetail";
import { getStoredUser } from "./lib/api-client";

function RequireAuth({ children }: { children: ReactNode }) {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/queues" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="queues"
          element={
            <RequireAuth>
              <QueueList />
            </RequireAuth>
          }
        />
        <Route
          path="queues/new"
          element={
            <RequireAuth>
              <CreateQueue />
            </RequireAuth>
          }
        />
        <Route
          path="queues/:queueId"
          element={
            <RequireAuth>
              <QueueDetail />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/queues" replace />} />
      </Route>
    </Routes>
  );
}
