import { Link } from 'react-router-dom';
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-8xl font-bold text-blue-600 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
      <Link to="/dashboard" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700">Back to Dashboard</Link>
    </div>
  </div>
);
export default NotFoundPage;
