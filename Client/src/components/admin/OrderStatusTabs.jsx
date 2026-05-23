const OrderStatusTabs = ({ tabs, activeTab, onTabChange, statusCounts }) => {
  const getCount = (status) => {
    return statusCounts[status] || 0;
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-6 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab.key} 
            onClick={() => onTabChange(tab.key)} 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.key 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
            {getCount(tab.key) > 0 && (
              <span className={`ml-2 text-xs font-semibold py-0.5 px-2 rounded-full ${
                activeTab === tab.key 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getCount(tab.key)}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OrderStatusTabs;
