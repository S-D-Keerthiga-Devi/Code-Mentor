import React, { useState, useEffect } from 'react';
import { 
  LightBulbIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getSuggestions, getSuggestionStats } from '../../services/api';

const AISuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch suggestions from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both suggestions and stats in parallel
        const [suggestionsResponse, statsResponse] = await Promise.all([
          getSuggestions(1, 10),
          getSuggestionStats()
        ]);

        if (suggestionsResponse.success) {
          setSuggestions(suggestionsResponse.data.suggestions);
          setPagination(suggestionsResponse.data.pagination);
        }

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Failed to load suggestions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (valid, confidence) => {
    if (valid && confidence >= 0.8) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    } else if (valid && confidence >= 0.6) {
      return <ShieldCheckIcon className="w-5 h-5 text-blue-500" />;
    } else if (valid) {
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    } else {
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (valid, confidence) => {
    if (valid && confidence >= 0.8) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (valid && confidence >= 0.6) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (valid) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusText = (valid, confidence) => {
    if (valid && confidence >= 0.8) {
      return 'High Confidence';
    } else if (valid && confidence >= 0.6) {
      return 'Verified';
    } else if (valid) {
      return 'Low Confidence';
    } else {
      return 'Failed';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Suggestions History</h2>
              <p className="text-sm text-gray-600 mt-1">
                Track all your AI-powered code suggestions and their verification status
              </p>
            </div>
          </div>
          
          {stats && (
            <div className="flex space-x-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{stats.totalSuggestions}</div>
                <div className="text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{stats.validSuggestions}</div>
                <div className="text-gray-500">Valid</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-indigo-600">{(stats.avgConfidence * 100).toFixed(0)}%</div>
                <div className="text-gray-500">Avg Confidence</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {suggestions.length === 0 && !loading ? (
          <div className="p-8 text-center">
            <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No AI suggestions yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start using Safe Suggestion Mode to see your AI suggestions here
            </p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div key={suggestion._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(suggestion.valid, suggestion.confidence)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(suggestion.valid, suggestion.confidence)}`}>
                        {getStatusText(suggestion.valid, suggestion.confidence)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(suggestion.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <span className={`font-semibold ${getConfidenceColor(suggestion.confidence)}`}>
                    {(suggestion.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <CodeBracketIcon className="w-4 h-4 mr-1" />
                    Original Code ({suggestion.language})
                  </h4>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm font-mono text-gray-800 max-h-32 overflow-y-auto">
                    {suggestion.codeContext}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">AI Suggestion</h4>
                  <div className="bg-indigo-50 rounded-lg p-3 text-sm font-mono text-indigo-900 max-h-32 overflow-y-auto">
                    {suggestion.suggestion}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Reasoning</h4>
                  <p className="text-sm text-gray-600">{suggestion.reasoning || 'No reasoning provided'}</p>
                </div>

                {suggestion.securityIssues && suggestion.securityIssues.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mr-1" />
                      <h4 className="text-sm font-medium text-red-900">Security Issues Detected</h4>
                    </div>
                    <ul className="text-sm text-red-700">
                      {suggestion.securityIssues.map((issue, index) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {suggestions.length} of {pagination.totalItems} suggestions
            </div>
            <div className="flex items-center space-x-2">
              <button 
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button 
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
