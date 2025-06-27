import React, { useState, useEffect } from 'react';
import { Feedback } from './utils/ResponseCoach/interfaces';
import { fetchFeedbacks, findFirstUserMsg } from './utils/ResponseCoach/utils';
import { set } from 'date-fns';


const ResponseCoach: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<Feedback | null>(null);
  const [improvedResponse, setImprovedResponse] = useState('');
  const [issueType, setIssueType] = useState('');
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback[]>([]);


  useEffect(() => {
      const loadFeedbackData = async () => {
        const data = await fetchFeedbacks();
        if (data) {
          setFeedbackData(data);
          switch (filter) {
            case 'all':
              setCurrentFeedback(data);
              setSelectedConversation(data[0] || null);
              break;
            case 'negative':
              setCurrentFeedback(data.filter(conv => conv.status === 'Negative'));
              setSelectedConversation(data.find(conv => conv.status === 'Negative') || null);
              break;
            case 'gaps':
              setCurrentFeedback(data.filter(conv => conv.status === 'Knowledge Gap'));
              setSelectedConversation(data.find(conv => conv.status === 'Knowledge Gap') || null);
              break;
            case 'improvement':
              setCurrentFeedback(data.filter(conv => conv.status === 'Needs Work'));
              setSelectedConversation(data.find(conv => conv.status === 'Needs Work') || null);
              break;
            default:
              break;
          }
        }
      }

      loadFeedbackData();
    }, [filter]);
  
  // // Filter conversations based on selected filter
  // const filteredConversations = SAMPLE_CONVERSATIONS.filter(conv => {
  //   if (filter === 'all') return true;
  //   if (filter === 'negative') return conv.feedback.rating < 3;
  //   if (filter === 'gaps') return conv.status === 'Knowledge Gap';
  //   if (filter === 'improvement') return conv.status === 'Needs Improvement';
  //   return true;
  // });
  
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
          {currentFeedback.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conv.id ? 'bg-amber-50 border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-gray-900">{conv.user.slice(0, 15) + (conv.user.length > 15 ? '...' : '')}</span>
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
                {new Date(conv.timestamp).toLocaleString(undefined, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </div>
              <div className="text-sm text-gray-900 truncate">
                {findFirstUserMsg(conv.messages).content}
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
                  {conv.category || 'Others'}
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
                {new Date(selectedConversation.timestamp).toLocaleString(undefined, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })} • {selectedConversation.category || 'Others'}
              </div>
            </div>
            
            {/* Conversation content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* chat history */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Chat History:</div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col gap-2">
                  {selectedConversation.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div>
                        <div className="flex items-center mb-1 gap-2">
                          <span className={`text-sm font-medium ${msg.sender === 'user' ? 'text-purple-600' : 'text-cyan-600'}`}>
                            {msg.sender === 'user' ? 'User' : 'Bot'}
                          </span>
                          <time className="text-xs text-gray-400">
                            {new Date(msg.timestamp).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </time>
                        </div>
                        <div className={`px-4 py-2 rounded-xl max-w-xs text-sm ${msg.sender === 'user'? 'bg-violet-200 text-gray-800 rounded-bl-none': 'bg-cyan-800 text-white rounded-br-none'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
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
                      value={improvedResponse || selectedConversation.messages[1].content}
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