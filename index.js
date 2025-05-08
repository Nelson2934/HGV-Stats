// File: pages/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to My Website</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col space-y-4">
          <Link href="/login">
            <a className="px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700 transition">
              Login
            </a>
          </Link>
          <p className="text-gray-600 text-center">
            Visit the public part of the site or login to access the admin panel.
          </p>
        </div>
      </div>
    </div>
  );
}

// File: pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // In a real application, you would call an API endpoint
    // Here we're using mock credentials for demonstration
    if (username === 'admin' && password === 'password123') {
      // Set a simple token in localStorage (use secure cookies in production)
      localStorage.setItem('authToken', 'demo-token-12345');
      localStorage.setItem('user', JSON.stringify({ username, role: 'admin' }));
      router.push('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Test credentials: admin / password123
          </p>
        </div>
      </div>
    </div>
  );
}

// File: pages/admin/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!authToken || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.username}</h2>
          <p className="text-gray-600 mb-4">
            This is your admin dashboard where you can manage your website content.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <DashboardCard 
              title="Users" 
              count="24" 
              icon="👥"
            />
            <DashboardCard 
              title="Posts" 
              count="142" 
              icon="📝"
            />
            <DashboardCard 
              title="Comments" 
              count="358" 
              icon="💬"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function DashboardCard({ title, count, icon }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <h3 className="font-medium text-gray-700">{title}</h3>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </div>
    </div>
  );
}

// File: components/AdminLayout.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!authToken || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <SidebarLink href="/admin" icon="📊" text="Dashboard" active={router.pathname === '/admin'} />
          <SidebarLink href="/admin/users" icon="👥" text="Users" active={router.pathname === '/admin/users'} />
          <SidebarLink href="/admin/posts" icon="📝" text="Posts" active={router.pathname === '/admin/posts'} />
          <SidebarLink href="/admin/settings" icon="⚙️" text="Settings" active={router.pathname === '/admin/settings'} />
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.username}</span>
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, text, active }) {
  return (
    <Link href={href}>
      <a className={`flex items-center px-6 py-3 hover:bg-gray-700 ${active ? 'bg-gray-700' : ''}`}>
        <span className="mr-3">{icon}</span>
        <span>{text}</span>
      </a>
    </Link>
  );
}

// File: pages/admin/users.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Mock user data
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'User' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor' },
  ]);

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      router.push('/login');
      return;
    }
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add New User
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'Editor' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

// File: pages/_app.js
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;

// File: styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// File: tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

// File: next.config.js
module.exports = {
  reactStrictMode: true,
};

// File: package.json
{
  "name": "admin-login-portal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^12.1.0",
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.2",
    "eslint": "8.9.0",
    "eslint-config-next": "12.1.0",
    "postcss": "^8.4.6",
    "tailwindcss": "^3.0.23"
  }
}
