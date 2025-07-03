import React, { useState, useEffect } from 'react';
import swal from 'sweetalert';
import { findFirstUserMsg, upsertDashboardDbFeedbacks, generateInitialImprovedResponse, checkIfOneImprovementExists } from './utils/ResponseCoach/utils';
import { FeedbackModel } from '../../apis/dashboard/interfaces';
import { updateFeedback, markFeedbackResolved } from '../../apis/dashboard/apis';
import { impactOptions } from './utils/ResponseCoach/static';
import { ResponseImprovements } from './utils/ResponseCoach/interfaces';



const ResponseCoach: React.FC = () => {
  const [filter, setFilter] = useState<string>('unread');
  const [selectedConversation, setSelectedConversation] = useState<FeedbackModel | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackModel[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackModel[]>([]);
  const [selectedImproved, setSelectedImproved] = useState<Record<string, ResponseImprovements>>({});


  useEffect(() => {
      const loadFeedbackData = async () => {
        const data = await upsertDashboardDbFeedbacks();
        if (data) {
          setSelectedImproved(generateInitialImprovedResponse(data));
          setFeedbackData(data);
          switch (filter) {
            case 'unread':
              setCurrentFeedback(data.filter(conv => conv.status === 'Unread'));
              setSelectedConversation(data.find(conv => conv.status === 'Unread') || null);
              break;
            case 'negative':
              setCurrentFeedback(data.filter(conv => conv.status === 'Unread' && conv.negative));
              setSelectedConversation(data.find(conv => conv.status === 'Unread' && conv.negative) || null);
              break;
            case 'all':
              setCurrentFeedback(data);
              setSelectedConversation(data[0]);
              break;
            case 'analyzed':
              setCurrentFeedback(data.filter(conv => conv.status === 'In Progress'));
              setSelectedConversation(data.find(conv => conv.status === 'In Progress') || null);
              break;
            default:
              break;
          }
        }
      }

      loadFeedbackData();
    }, [filter]);
  
  // Handle improved response submission
  const handleSubmitImprovement = async(sessionId: string, upsert=false) => {
    const allAnalyzed = Object.values(selectedImproved[sessionId]?.responseImprovements || {}).every(resp => resp.issueClassified && resp.improvedResponse);
    const response = await updateFeedback({
      sessionId: sessionId,
      responseImprovement: selectedImproved[sessionId].responseImprovements,
      all_analyzed: allAnalyzed,
      impact: selectedImproved[sessionId].impact,
      status: 'In Progress',
    });
    setFeedbackData(prev => prev.map(feedback => 
      feedback.sessionId === sessionId ? { ...feedback, ...response } : feedback
    ));
    await swal({
      title: "Submitted",
      text: `Your response improvement has been ${upsert ? 'updated' : 'submitted'} successfully. Session ID: ${sessionId}`,
      icon: "success",
    });
  };

  // useEffect(() => {
  //   console.debug('Selected Improved State:', selectedImproved);
  // }, [selectedImproved]);

  const handleImpactChanges = (impact: string, sessionId: string) => {
    const prevData = selectedImproved[sessionId] || { responseImprovements: [] };
    if (!["Low", "Medium", "High", "Very High"].includes(impact)) return;
    setSelectedImproved(prev => ({
      ...prev,
      [sessionId]: {
        impact: impact as "Low" | "Medium" | "High" | "Very High",
        responseImprovements: prevData.responseImprovements,
      },
    }));
  };

  const handleIssueTypeChange = (idx: number, type: string, sessionId: string) => {
    const prevData = selectedImproved[sessionId] || { responseImprovements: [] };
    prevData.responseImprovements[idx] = {
      ...prevData.responseImprovements[idx],
      issueClassified: type,
    };
    setSelectedImproved(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        responseImprovements: prevData.responseImprovements,
      },
    }));
  };

  const handleImprovedResponseChange = (index: number, response: string, sessionId: string) => {
    const prevData = selectedImproved[sessionId] || { responseImprovements: [] };
    prevData.responseImprovements[index] = {
      ...prevData.responseImprovements[index],
      improvedResponse: response,
    };
    setSelectedImproved(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        responseImprovements: prevData.responseImprovements,
      },
    }));
  };

  const handleMarkAsResolved = async (sessionId: string) => {
    const response = await markFeedbackResolved(sessionId);
    setFeedbackData(prev => prev.map(feedback =>
      feedback.sessionId === sessionId ? { ...feedback, ...response } : feedback
    ));
    setSelectedConversation(null);
    await swal({
      title: "Marked as Resolved",
      text: `The conversation has been marked as resolved. Session ID: ${sessionId}`,
      icon: "success",
    });
  }
  
  return (
    <div className="flex h-[calc(100vh-300px)] min-h-[500px] border border-gray-200 rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Filter tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-2 text-sm font-medium flex-1 ${
                filter === 'unread'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread
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
              onClick={() => setFilter('analyzed')}
              className={`px-3 py-2 text-sm font-medium flex-1 ${
                filter === 'analyzed'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Analyzed
            </button>
          </nav>
        </div>
        
        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {currentFeedback.map((conv) => (
            <div
              key={conv.sessionId}
              onClick={() => setSelectedConversation(conv)}
              className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.sessionId === conv.sessionId ? 'bg-amber-50 border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-gray-900">#User {conv.userId.slice(0, 15) + (conv.userId.length > 15 ? '...' : '')}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  conv.negative ? 'bg-red-100 text-red-800' :
                  conv.status === 'Unread' ? 'bg-green-100 text-green-800' :
                  conv.status === 'All' ? 'bg-purple-100 text-purple-800' :
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
                  {conv.categories.join(', ') || 'Others'}
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
                <h3 className="text-lg font-medium text-gray-900">#User {selectedConversation.userId}</h3>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  selectedConversation.negative ? 'bg-red-100 text-red-800' :
                  selectedConversation.status === 'Unread' ? 'bg-green-100 text-green-800' :
                  selectedConversation.status === 'All' ? 'bg-purple-100 text-purple-800' :
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
                })} • {selectedConversation.categories.join(', ') || 'Others'}
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
                          <span className={`text-sm font-medium ${msg.sender === 'user' ? 'text-purple-600' : msg.sender === 'bot' ? 'text-cyan-400' : 'text-gray-600'}`}>
                            {msg.sender === 'user' ? 'User' : msg.sender === 'bot' ? 'Bot' : 'System'}
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
                  <div className="mb-3 gap-2 flex flex-col">

                    {/* impact */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Impact Level
                    </label>
                    <div className="flex gap-2 mb-2">
                      {impactOptions.map((option) => (
                        <button
                          key={option.label}
                          onClick={() => handleImpactChanges(option.label, selectedConversation.sessionId)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            selectedImproved[selectedConversation.sessionId].impact === option.label
                              ? `${option.color}`
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    
                    {selectedImproved[selectedConversation.sessionId].responseImprovements.map((resp, index) => (
                      <div key={index} className='flex flex-col gap-2 mb-4'>
                        {/* bot response selection */}
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Response #{index+1}
                        </label>
                        <p className="text-sm text-gray-500 mb-2">
                          {resp.response}
                        </p>

                        {/* bot response's issue classification */}
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issue Classification #{index+1}
                        </label>
                        <select
                          value={resp.issueClassified || 'Please select an issue type'}
                          onChange={(e) => handleIssueTypeChange(index, e.target.value, selectedConversation.sessionId)}
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

                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Improved Response #{index+1}
                          </label>
                          <textarea
                            value={selectedImproved[selectedConversation.sessionId]?.responseImprovements[index]!.improvedResponse || ''}
                            onChange={(e) => handleImprovedResponseChange(index, e.target.value, selectedConversation.sessionId)}
                            rows={5}
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Suggest an improved response..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => {handleMarkAsResolved(selectedConversation.sessionId)}}
                      className="px-4 py-2 mr-2 rounded-md bg-green-200 text-gray-700 hover:bg-green-300"
                    >
                      Mark as Resolved
                    </button>
                    {selectedConversation.status !== 'In Progress' && (
                      <button
                        onClick={() => handleSubmitImprovement(selectedConversation.sessionId)}
                        disabled={!checkIfOneImprovementExists(selectedImproved[selectedConversation.sessionId].responseImprovements)}
                        className={`px-4 py-2 rounded-md ${
                          !checkIfOneImprovementExists(selectedImproved[selectedConversation.sessionId].responseImprovements)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-darkBrown text-white hover:bg-darkBrownHover'
                        }`}
                      >
                        Submit Improvement
                      </button>
                    )}
                    {selectedConversation.status === 'In Progress' && (
                      <button
                        onClick={() => handleSubmitImprovement(selectedConversation.sessionId)}
                        disabled={!checkIfOneImprovementExists(selectedImproved[selectedConversation.sessionId].responseImprovements)}
                        className={`px-4 py-2 rounded-md ${
                          !checkIfOneImprovementExists(selectedImproved[selectedConversation.sessionId].responseImprovements)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-darkBrown text-white hover:bg-darkBrownHover'
                        }`}
                      >
                        Make Changes
                      </button>
                    )}
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