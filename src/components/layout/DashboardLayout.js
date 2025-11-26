import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  CreditCardIcon,
  HomeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  InboxIcon,
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ authValue }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const auth = useAuth();
  const { user, logout } = authValue || auth;
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: location.pathname === '/dashboard' },
    ];

    if (user?.role === 'staff') {
      return [
        ...baseItems,
        { name: 'My Requests', href: '/dashboard/requests/my', icon: DocumentTextIcon, current: location.pathname === '/dashboard/requests/my' },
        { name: 'Create Request', href: '/dashboard/requests/create', icon: ShoppingCartIcon, current: location.pathname === '/dashboard/requests/create' },
      ];
    }

    if (user?.role?.includes('approver') || user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'All Requests', href: '/dashboard/requests', icon: DocumentTextIcon, current: location.pathname === '/dashboard/requests' },
        { name: 'Pending Approvals', href: '/dashboard/approvals', icon: InboxIcon, current: location.pathname === '/dashboard/approvals' },
        { name: 'My Requests', href: '/dashboard/requests/my', icon: ShoppingCartIcon, current: location.pathname === '/dashboard/requests/my' },
      ];
    }

    if (user?.role === 'finance') {
      return [
        ...baseItems,
        { name: 'All Requests', href: '/dashboard/requests', icon: DocumentTextIcon, current: location.pathname === '/dashboard/requests' },
        { name: 'Approved Requests', href: '/dashboard/requests/approved', icon: CheckCircleIcon, current: location.pathname === '/dashboard/requests/approved' },
        { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon, current: location.pathname === '/dashboard/analytics' },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'All Requests', href: '/dashboard/requests', icon: DocumentTextIcon, current: location.pathname === '/dashboard/requests' },
        { name: 'Users', href: '/dashboard/users', icon: UsersIcon, current: location.pathname === '/dashboard/users' },
        { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon, current: location.pathname === '/dashboard/analytics' },
        { name: 'Settings', href: '/dashboard/settings', icon: CogIcon, current: location.pathname === '/dashboard/settings' },
      ];
    }

    return baseItems;
  };

  const navigation = getNavigationItems();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'staff': 'Staff Member',
      'approver_level_1': 'Approver Level 1',
      'approver_level_2': 'Approver Level 2',
      'finance': 'Finance Team',
      'admin': 'Administrator'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`relative z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            
            {/* Mobile sidebar content */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">Procurify</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                      className={`${
                        item.current
                          ? 'bg-primary-50 border-r-4 border-primary-500 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md w-full text-left transition-colors`}
                    >
                      <Icon className="mr-4 h-6 w-6" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Procurify</span>
            </div>
            
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`${
                      item.current
                        ? 'bg-primary-50 border-r-4 border-primary-500 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* User section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div>
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {getRoleDisplayName(user?.role)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-200">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Page header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  {navigation.find(item => item.current)?.name || 'Dashboard'}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Search..."
                    />
                  </div>
                </div>

                {/* Notifications */}
                <button className="bg-white p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                  <BellIcon className="h-6 w-6" />
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    type="button"
                    className="bg-white rounded-lg p-2 flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <UserCircleIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <button
                        onClick={() => {
                          navigate('/dashboard/profile');
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <UserCircleIcon className="mr-3 h-4 w-4" />
                        Your Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/dashboard/settings');
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <CogIcon className="mr-3 h-4 w-4" />
                        Settings
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;