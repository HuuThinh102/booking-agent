import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './routes/homePage/HomePage.tsx'
import RootLayout from './layouts/rootLayout/RootLayout.tsx'
import './index.css'
import DashboardLayout from './layouts/dashboardLayout/DashboardLayout.tsx'
import DashboardPage from './routes/dashboardPage/DashboardPage.tsx'
import ChatPage from './routes/chatPage/ChatPage.tsx'
import SignInPage from './routes/signInPage/SignInPage.tsx'
import SignUpPage from './routes/signUpPage/SignUpPage.tsx'
import '@ant-design/v5-patch-for-react-19';



const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/sign-in/*",
        element: <SignInPage />,
      },
      {
        path: "/sign-up/*",
        element: <SignUpPage />,
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/dashboard/chats/:id",
            element: <ChatPage />,
          }
        ]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)