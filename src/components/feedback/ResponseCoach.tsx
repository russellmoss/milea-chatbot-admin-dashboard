import React, { useState } from 'react';

// Sample conversation data
const SAMPLE_CONVERSATIONS = [
  {
    id: 1,
    user: "User #452",
    timestamp: "2023-05-15T14:32:00",
    query: "I'm looking for a red wine that pairs well with steak. What do you recommend?",
    response: "I'd be happy to help you find the perfect wine for your steak dinner! Our Cabernet Franc would be an excellent choice. It has rich flavors of black cherry and plum with subtle notes of herbs that complement red meat beautifully. The 2022 vintage is particularly good with grilled steaks. Would you like more information about this wine?",
    feedback: {
      rating: 5,
      comment: "Exactly what I was looking for! Thank you."
    },
    category: "Wine Recommendations",
    status: "Positive"
  },
  {
    id: 2,
    user: "User #387",
    timestamp: "2023-05-14T11:20:00",
    query: "Can I book a tasting for tomorrow at 2pm?",
    response: "I'd be happy to help with booking a tasting! Our tasting room is open daily from 10am to 5pm. For reservations, I recommend using our online booking system at exploretock.com/mileaestatevineyard or you can call us directly at (845) 677-8463. Would you like me to help you navigate to our reservation page?",
    feedback: {
      rating: 3,
      comment: "I wanted to book directly in the chat but was directed elsewhere."
    },
    category: "Reservations",
    status: "Needs Improvement"
  },
  {
    id: 3,
    user: "User #521",
    timestamp: "2023-05-13T16:05:00",
    query: "What's the difference between your wine club tiers?",
    response: "We offer three wine club membership tiers: Jumper, Grand Prix, and Triple Crown. The Jumper includes 3 bottles quarterly, Grand Prix includes 6 bottles, and Triple Crown includes 12 bottles. All members receive discounts on wine purchases, complimentary tastings, and special event invitations. The higher tiers include access to limited releases and special events. Would you like more details about a specific tier?",
    feedback: {
      rating: 5,
      comment: "Very clear explanation, thank you."
    },
    category: "Wine Club",
    status: "Positive"
  },
  {
    id: 4,
    user: "User #634",
    timestamp: "2023-05-12T09:47:00",
    query: "Do you have any white wines that aren't too sweet?",
    response: "Yes, we have several dry white wines you might enjoy. Our Grüner Veltliner is crisp with notes of green apple and white pepper. The Chardonnay is medium-bodied with subtle oak influence. Both are dry styles that pair well with food. Would you like more information about either of these options?",
    feedback: {
      rating: 4,
      comment: "Good suggestions but I wish there were more options."
    },
    category: "Wine Recommendations",
    status: "Positive"
  },
  {
    id: 5,
    user: "User #289",
    timestamp: "2023-05-11T13:22:00",
    query: "How much is shipping for 6 bottles to California?",
    response: "For shipping to California, the cost for 6 bottles would typically be around $28-32 depending on the exact location. However, we offer free shipping on orders of 12 bottles or more, or on orders over $150. Would you like to know about any current shipping promotions?",
    feedback: {
      rating: 2,
      comment: "The shipping info was wrong. I was charged $40."
    },
    category: "Shipping & Delivery",
    status: "Negative"
  },
  {
    id: 6,
    user: "User #176",
    timestamp: "2023-05-10T15:50:00",
    query: "What time do you close today?",
    response: "Our tasting room is open until 5pm today. Last tastings are seated at 4:30pm. Is there anything else you'd like to know about visiting us?",
    feedback: {
      rating: 5,
      comment: "Straightforward and helpful."
    },
    category: "Visiting Hours",
    status: "Positive"
  },
  {
    id: 7,
    user: "User #742",
    timestamp: "2023-05-09T11:03:00",
    query: "Do you allow pets on the property?",
    response: "We welcome well-behaved dogs on leashes in our outdoor areas, but service animals only are permitted inside the tasting room due to health regulations. We have water bowls available for your furry friends! Would you like any other information about visiting with pets?",
    feedback: {
      rating: 5,
      comment: "Exactly what I needed to know, thanks!"
    },
    category: "Visiting Info",
    status: "Positive"
  },
  {
    id: 8,
    user: "User #115",
    timestamp: "2023-05-08T14:17:00",
    query: "I'm trying to find info about your 2021 Pinot Noir",
    response: "I'm happy to help you with information about our wines. However, I don't see a 2021 Pinot Noir in our current lineup. We offer several other red wines including our Cabernet Franc, Blaufränkisch, and red blends. Would you like information about any of these wines instead?",
    feedback: {
      rating: 1,
      comment: "You definitely have a 2021 Pinot Noir. I bought it last month."
    },
    category: "Wine Info",
    status: "Knowledge Gap"
  }
];

const ResponseCoach: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(SAMPLE_CONVERSATIONS[0]);
  const [improvedResponse, setImprovedResponse] = useState('');
  const [issueType, setIssueType] = useState('');
  
  // Filter conversations based on selected filter
  const filteredConversations = SAMPLE_CONVERSATIONS.filter(conv => {
    if (filter === 'all') return true;
    if (filter === 'negative') return conv.feedback.rating < 3;
    if (filter === 'gaps') return conv.status === 'Knowledge Gap';
    if (filter === 'improvement') return conv.status === 'Needs Improvement';
    return true;
  });
  
  // Handle improved response submission
  const handleSubmitImprovement = () => {
    alert(`Training data submitted:\nIssue Type: ${issueType}\nImproved Response: ${improvedResponse}`);
    setImprovedResponse('');
    setIssueType('');
  };
  
  return (
    <div className="flex h-[calc(100vh-300px)] min-h-[500px] border border-gray-200 rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Filter tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 text-sm font-medium flex-1 ${
                filter === 'all'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('negative')}
              className={`px-3 py-2 text-sm font-medium flex-1 ${
                filter === 'negative'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Negative
            </button>
            <button
              onClick={() => setFilter('gaps')}
              className={`px-3 py-2 text-sm font-medium flex-1 ${
                filter === 'gaps'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gaps
            </button>
            <button
              onClick={() => setFilter('improvement')}
              className={`px-3 py-2 text-sm font-medium flex-1 ${
                filter === 'improvement'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Needs Work
            </button>
          </nav>
        </div>
        
        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conv.id ? 'bg-amber-50 border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-gray-900">{conv.user}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  conv.status === 'Positive' ? 'bg-green-100 text-green-800' :
                  conv.status === 'Negative' ? 'bg-red-100 text-red-800' :
                  conv.status === 'Knowledge Gap' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {conv.status}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-1">
                {new Date(conv.timestamp).toLocaleString()}
              </div>
              <div className="text-sm text-gray-900 truncate">
                {conv.query}
              </div>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg 
                      key={star} 
                      className={`h-4 w-4 ${star <= conv.feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {conv.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation && (
          <>
            {/* Conversation header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{selectedConversation.user}</h3>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  selectedConversation.status === 'Positive' ? 'bg-green-100 text-green-800' :
                  selectedConversation.status === 'Negative' ? 'bg-red-100 text-red-800' :
                  selectedConversation.status === 'Knowledge Gap' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedConversation.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(selectedConversation.timestamp).toLocaleString()} • {selectedConversation.category}
              </div>
            </div>
            
            {/* Conversation content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* User query */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">User Query:</div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  {selectedConversation.query}
                </div>
              </div>
              
              {/* Bot response */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Bot Response:</div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  {selectedConversation.response}
                </div>
              </div>
              
              {/* User feedback */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">User Feedback:</div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg 
                          key={star} 
                          className={`h-5 w-5 ${star <= selectedConversation.feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {selectedConversation.feedback.rating}/5
                    </span>
                  </div>
                  <div>
                    {selectedConversation.feedback.comment}
                  </div>
                </div>
              </div>
              
              {/* Training interface */}
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Improvement Suggestions:</div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Classification
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select an issue type...</option>
                      <option value="incorrect_information">Incorrect Information</option>
                      <option value="missing_information">Missing Information</option>
                      <option value="needs_clarification">Needs Clarification</option>
                      <option value="tone_issues">Tone Issues</option>
                      <option value="formatting_issues">Formatting Issues</option>
                      <option value="knowledge_gap">Knowledge Gap</option>
                      <option value="other">Other Issue</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Improved Response
                    </label>
                    <textarea
                      value={improvedResponse || selectedConversation.response}
                      onChange={(e) => setImprovedResponse(e.target.value)}
                      rows={5}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Suggest an improved response..."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitImprovement}
                      disabled={!issueType || !improvedResponse}
                      className={`px-4 py-2 rounded-md ${
                        !issueType || !improvedResponse
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-darkBrown text-white hover:bg-darkBrownHover'
                      }`}
                    >
                      Submit Improvement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResponseCoach;