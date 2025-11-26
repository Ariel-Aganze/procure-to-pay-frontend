import React from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  CreditCardIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  ClockIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Smart Document Processing',
      description: 'AI-powered extraction and processing of invoices, receipts, and purchase orders.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Multi-Level Approval',
      description: 'Configurable approval workflows with role-based access controls.',
    },
    {
      icon: ChartBarIcon,
      title: 'Real-Time Analytics',
      description: 'Comprehensive insights into spending patterns and procurement performance.',
    },
    {
      icon: ClockIcon,
      title: 'Automated Workflows',
      description: 'Streamline your procurement process with intelligent automation.',
    },
  ];

  const benefits = [
    'Reduce processing time by 80%',
    'Eliminate manual data entry',
    'Ensure compliance and transparency',
    'Real-time spend visibility',
    'Integrated approval workflows',
    'AI-powered insights',
  ];

  const stats = [
    { value: '10,000+', label: 'Requests Processed' },
    { value: '500+', label: 'Companies Trust Us' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">
                  Procurify
                </span>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-10">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">
                Benefits
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Streamline Your{' '}
              <span className="text-gradient">
                Procurement
              </span>{' '}
              Process
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Automate purchase requests, approvals, and document processing with AI-powered intelligence. 
              Take control of your spend with enterprise-grade procurement software.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-4">
                Watch Demo
                <SparklesIcon className="ml-2 w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-32 right-1/4 w-64 h-64 bg-primary-200 rounded-full opacity-10 blur-2xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Procurement
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your procurement process efficiently, 
              from request to payment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Why Companies Choose Procurify
              </h2>
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn-primary text-lg">
                Get Started Today
              </Link>
            </div>

            <div className="relative">
              <div className="card-soft p-8">
                <div className="bg-gradient-primary rounded-xl p-6 text-white mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm opacity-90">Purchase Request</span>
                    <div className="badge bg-white/20 text-white">Approved</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Office Equipment</h3>
                  <p className="text-2xl font-bold">$2,500.00</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Request ID</span>
                    <span className="font-medium">#REQ-2024-001</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Approver</span>
                    <span className="font-medium">John Smith</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Status</span>
                    <span className="badge-success">Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Procurement?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that have streamlined their procurement process with Procurify.
          </p>
          <Link
            to="/register"
            className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold">Procurify</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The modern procurement platform that helps companies streamline their purchase-to-pay process.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">Features</a>
                <a href="#" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block hover:text-white transition-colors">Documentation</a>
                <a href="#" className="block hover:text-white transition-colors">API</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">About</a>
                <a href="#" className="block hover:text-white transition-colors">Contact</a>
                <a href="#" className="block hover:text-white transition-colors">Privacy</a>
                <a href="#" className="block hover:text-white transition-colors">Terms</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Procurify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;