import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationToast = ({ notification, onRemove }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const handleActionClick = (e) => {
        e.stopPropagation();
        if (notification.action && notification.action.onClick) {
            notification.action.onClick();
        }
        onRemove(notification.id);
    };

    return (
        <div
            className={`flex items-start p-4 mb-3 rounded-lg border shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl ${getBgColor(notification.type)}`}
            onClick={() => onRemove(notification.id)}
        >
            <div className="flex-shrink-0 mr-3">
                {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                </p>
                {notification.action && (
                    <button
                        onClick={handleActionClick}
                        className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                    >
                        {notification.action.label}
                    </button>
                )}
            </div>
            <div className="flex-shrink-0 ml-3">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(notification.id);
                    }}
                    className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default NotificationToast;