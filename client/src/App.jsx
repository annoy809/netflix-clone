// /src/App.jsx
import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";

/* =============================
   🚀 Lazy Loaded Pages
============================= */
const Home = lazy(() => import("./pages/Home"));
const Player = lazy(() => import("./pages/player"));

/* =============================
   ✨ Smooth Loader
============================= */
const SmoothLoader = () => (
  <div
  className="smooth-loader"
    style={{
      width: "100%",
      height: "100vh",
      background: "linear-gradient(90deg, #222, #333, #222)",
      animation: "pulse 1.5s infinite",
    }}
  ></div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<SmoothLoader />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "/player",
    element: (
      <Suspense fallback={<SmoothLoader />}>
        <Player />
      </Suspense>
    ),
  },

]);

export default function App() {
  return <RouterProvider router={router} />;
}
