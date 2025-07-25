/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Settings, Store } from 'lucide-react';
import { cancelSync, getAllUrls } from '../../apis/scraper/apis';
import validator from 'validator';
import { getUrlsBasedOnBaseUrl, updateWebSync, createWebSync } from '../../apis/websync/apis';
import { WebSyncModel } from '../../apis/websync/interfaces';
import { startSync, SyncStatusWebSocket } from '../../apis/scraper/apis';
import { getSyncSetting, updateWebSyncSetting } from '../../apis/setting/apis';
import { SyncSetting } from '../../apis/setting/interfaces';

// Define types
interface SyncSource {
  id: string;
  name: string;
  lastSync: string | null;
  status: 'success' | 'warning' | 'error' | 'pending' | 'never';
  itemCount: number;
}

interface SyncHistoryItem {
  id: string;
  timestamp: string;
  source: string;
  changes: {
    added: number;
    updated: number;
    deleted: number;
  };
  status: 'success' | 'partial' | 'failed';
  details: string;
}

const SyncControls: React.FC = () => {
  const [syncSettings, setSyncSettings] = useState<SyncSetting | null>(null);
  const [syncSources, setSyncSources] = useState<SyncSource[]>([
    {
      id: 'website',
      name: 'Website Content',
      lastSync: '2023-05-15T09:30:00',
      status: 'success',
      itemCount: 52
    },
    {
      id: 'commerce7',
      name: 'Commerce7 Products',
      lastSync: '2023-05-14T14:45:00',
      status: 'success',
      itemCount: 28
    },
    {
      id: 'events',
      name: 'Event Calendar',
      lastSync: '2023-05-12T10:15:00',
      status: 'warning',
      itemCount: 15
    },
    {
      id: 'blog',
      name: 'Blog Posts',
      lastSync: '2023-05-10T16:30:00',
      status: 'success',
      itemCount: 24
    },
    {
      id: 'social',
      name: 'Social Media',
      lastSync: null,
      status: 'never',
      itemCount: 0
    }
  ]);
  const [activeSyncSource, setActiveSyncSource] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<number | null>(null);
  const [schedulingModalOpen, setSchedulingModalOpen] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<SyncHistoryItem | null>(null);
  const [settingOpen, setSettingOpen] = useState<string>("");
  const [webBaseUrl, setWebBaseUrl] = useState<string>("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [availableUrls, setAvailableUrls] = useState<string[]>([]);
  const [availableUrlsLoading, setAvailableUrlsLoading] = useState<boolean>(false);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([
    {
      id: 'sync1',
      timestamp: '2023-05-15T09:30:00',
      source: 'Website Content',
      changes: {
        added: 2,
        updated: 5,
        deleted: 0
      },
      status: 'success',
      details: 'Successfully synced all website content. 2 new pages added, 5 pages updated.'
    },
    {
      id: 'sync2',
      timestamp: '2023-05-14T14:45:00',
      source: 'Commerce7 Products',
      changes: {
        added: 1,
        updated: 3,
        deleted: 0
      },
      status: 'success',
      details: 'Successfully synced all product data. 1 new wine added, 3 wines updated with new vintages.'
    },
    {
      id: 'sync3',
      timestamp: '2023-05-12T10:15:00',
      source: 'Event Calendar',
      changes: {
        added: 2,
        updated: 1,
        deleted: 0
      },
      status: 'partial',
      details: 'Partially synced event data. 2 events added, 1 updated. Some event details could not be synced.'
    },
    {
      id: 'sync4',
      timestamp: '2023-05-10T16:30:00',
      source: 'Blog Posts',
      changes: {
        added: 3,
        updated: 0,
        deleted: 1
      },
      status: 'success',
      details: 'Successfully synced all blog posts. 3 new posts added, 1 deleted.'
    },
    {
      id: 'sync5',
      timestamp: '2023-05-08T11:20:00',
      source: 'Event Calendar',
      changes: {
        added: 0,
        updated: 0,
        deleted: 0
      },
      status: 'failed',
      details: 'Failed to sync event calendar. API connection timed out.'
    }
  ]);

  const continousMonitorWebSyncStatus = useCallback(async(jobId: string) => {
    const socket = SyncStatusWebSocket(jobId);
    socket.onmessage = async (event) => {
      const syncStatus = JSON.parse(event.data);
      setSyncProgress(syncStatus.progress);

      if (syncStatus.status === "complete") {
        // update sync settings
        const updatedSetting = await updateWebSyncSetting({
          itemCount: syncStatus.completed,
          status: "Synced",
          jobId: "",
        });
        setSyncSettings(updatedSetting);

        setActiveSyncSource(null);
        setSyncSources((sources) =>
          sources.map((source) =>
            source.id === "website"
              ? {
                  ...source,
                  status: "success",
                  lastSync: new Date().toISOString(),
                  itemCount: availableUrls.length,
                }
              : source
          )
        );

        socket.close();
      }
    };

    socket.onerror = async (error) => {
      console.error("WebSocket error:", error);
      socket.close();
      await cancelSync(jobId);
      await updateWebSyncSetting({jobId: ""});
      setSyncProgress(null);
      setActiveSyncSource(null);
    };

    socket.onclose = async () => {
      console.log("WebSocket of getting web sync closed");
    };
  }, [availableUrls])

  useEffect(() => {
    const fetchSyncSettings = async () => {
      const settings = await getSyncSetting();
      setSyncSettings(settings);
      setWebBaseUrl(settings.webSyncSetting.baseurl);
      setAvailableUrls(settings.webSyncSetting.urls);
      setSelectedUrls(settings.webSyncSetting.selectedUrls);

      if (settings.webSyncSetting.jobId && settings.webSyncSetting.selectedUrls.length > 0) {
        setActiveSyncSource("website");
        continousMonitorWebSyncStatus(settings.webSyncSetting.jobId);
      }
    };

    fetchSyncSettings();
  }, []);

  const handleRefreshUrls = async() => {
    setAvailableUrlsLoading(true);
    const subUrls = await getAllUrls(webBaseUrl);
    const objsStoredinDb = await getUrlsBasedOnBaseUrl(webBaseUrl);
    let webSyncModel: WebSyncModel | null = null;
    if (objsStoredinDb.length > 0) {
      // update available urls with the ones stored in db
      webSyncModel = await updateWebSync(objsStoredinDb[0].id, { urls: subUrls });
    } else {
      // create new web sync with the urls
      webSyncModel = await createWebSync({ baseurl: webBaseUrl, urls: subUrls });
    }
    if (webSyncModel) {
      setWebBaseUrl(webSyncModel.baseurl);
      setAvailableUrls(webSyncModel.urls);
      const selected = webSyncModel!.urls.filter((_url, i) => webSyncModel!.urlsChecked?.[i]);
      setSelectedUrls(selected);

      // also, update the sync settings
      const updatedSetting = await updateWebSyncSetting({ baseurl: webSyncModel.baseurl, urls: webSyncModel.urls, urlsChecked: webSyncModel.urlsChecked });
      setSyncSettings(updatedSetting);
      setAvailableUrlsLoading(false);
    }
  };

  // Get status label and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'success':
        return { label: 'Synced', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'warning':
        return { label: 'Partial Sync', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'error':
        return { label: 'Error', bgColor: 'bg-red-100', textColor: 'text-red-800' };
      case 'pending':
        return { label: 'Syncing...', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'never':
        return { label: 'Never Synced', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
      case 'partial':
        return { label: 'Partial Success', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'failed':
        return { label: 'Failed', bgColor: 'bg-red-100', textColor: 'text-red-800' };
      default:
        return { label: 'Unknown', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Handle sync button click
  const handleWebSync = async() => {
    if (activeSyncSource) {
      console.warn("A sync operation is already in progress. active one is: ", activeSyncSource);
      return;
    }

    setActiveSyncSource("website");
    setSyncSources((sources) =>
      sources.map((source) =>
        source.id === "website" ? { ...source, status: "pending" } : source
      )
    );

    if (selectedUrls.length === 0) {
      console.warn("No URLs selected for syncing.");
      return;
    }
    setSyncProgress(0);
    const startSyncResponse = await startSync(selectedUrls);

    if (!startSyncResponse.job_id) {
      console.error("No urls found to sync.");
      setActiveSyncSource(null);
      setSyncSources((sources) =>
        sources.map((source) =>
          source.id === "website"
            ? { ...source, status: "error", lastSync: null, itemCount: 0 }
            : source
        )
      );
      setSyncProgress(null);
      return;
    }
    await updateWebSyncSetting({ jobId: startSyncResponse.job_id });
    continousMonitorWebSyncStatus(startSyncResponse.job_id);
  };

  const handleC7Sync = async() => {

  };

  // Handle scheduling button click
  const handleSchedule = () => {
    setSchedulingModalOpen(true);
  };

  const handleSettingOpen = (sourceId: string) => {
    setSettingOpen(sourceId);
  };

  const handleToggleUrl = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  const handleWebUrlChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const possibleBaseUrl = e.target.value;
    if (validator.isURL(possibleBaseUrl)) {
      const possibleRecords = await getUrlsBasedOnBaseUrl(possibleBaseUrl);
      if (possibleRecords.length > 0) {
        const possibleUrls = Array.from(new Set(possibleRecords.map(record => record.urls).flat()));
        setAvailableUrls(possibleUrls);
        setSelectedUrls(possibleUrls);
      }
    }
    setWebBaseUrl(possibleBaseUrl);
  };

  const handleSaveSettings = async(baseUrl: string, selectedUrls: string[]) => {
    const urlRecords = await getUrlsBasedOnBaseUrl(baseUrl);
    const subdomainUrls = urlRecords[0].urls;
    let subdomainUrlsChecked = urlRecords[0].urlsChecked;
    const selectedUrlsSet = new Set(selectedUrls);
    for (let i = 0; i < subdomainUrls.length; i++) {
      const url = subdomainUrls[i];
      if (selectedUrlsSet.has(url)) {
        subdomainUrlsChecked[i] = true;
      } else {
        subdomainUrlsChecked[i] = false;
      }
    }
    await updateWebSync(urlRecords[0].id, { urlsChecked: subdomainUrlsChecked });
    const updatedSetting = await updateWebSyncSetting({ baseurl: baseUrl, urls: subdomainUrls, urlsChecked: subdomainUrlsChecked });
    setSyncSettings(updatedSetting);
    setSettingOpen("");
  };

  // Handle history item click
  const handleHistoryItemClick = (item: SyncHistoryItem) => {
    setSelectedHistoryItem(item);
  };
  
  // Handle revert click
  const handleRevert = () => {
    if (!selectedHistoryItem) return;
    
    // In a real app, this would call an API to revert changes
    alert(`Changes from ${selectedHistoryItem.source} sync would be reverted in a real application.`);
    
    // Close details panel
    setSelectedHistoryItem(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Sync status panel */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium text-gray-900">Content Sources</h3>
            <p className="mt-1 text-sm text-gray-500">
              Sync your knowledge base with external content sources.
            </p>
          </div>
          <button
            onClick={handleSchedule}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Schedule
          </button>
        </div>
        
        <div className="bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">

            {/* web sync */}
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><Globe className="h-8 w-8 text-gray-400" /></div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Website Content</h4>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${syncSettings?.webSyncSetting.status === 'Synced' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {syncSettings?.webSyncSetting.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          Last sync: {formatTimestamp(syncSettings?.webSyncSetting.lastSynced ? syncSettings?.webSyncSetting.lastSynced : null)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {syncSettings?.webSyncSetting.itemCount} items
                        </span>
                      </div>
                    </div>
                  </div>
                    
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {activeSyncSource === "website" ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${syncProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {syncProgress}%
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleWebSync()}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-darkBrown focus:outline-none"
                        >
                          Sync Now
                        </button>
                        <button
                          onClick={() => handleSettingOpen("website")}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-darkBrown focus:outline-none"
                        >
                          <Settings size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
              {/* Progress bar for syncing source */}
              {activeSyncSource === "website" && syncProgress !== null && (
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${syncProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </li>

            {/* Commerce7 Products Sync */}
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><Store className="h-8 w-8 text-gray-400" /></div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Commerce7 Products</h4>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${syncSettings?.commerce7SyncSetting.status === 'Synced' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {syncSettings?.commerce7SyncSetting.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          Last sync: {formatTimestamp(syncSettings?.commerce7SyncSetting.lastSynced ? syncSettings?.commerce7SyncSetting.lastSynced : null)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {syncSettings?.commerce7SyncSetting.itemCount} items
                        </span>
                      </div>
                    </div>
                  </div>
                    
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {activeSyncSource === "commerce7" ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${syncProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {syncProgress}%
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleC7Sync()}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-darkBrown focus:outline-none"
                        >
                          Sync Now
                        </button>
                        <button
                          onClick={() => handleSettingOpen("commerce7")}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-darkBrown focus:outline-none"
                        >
                          <Settings size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
              {/* Progress bar for syncing source */}
              {activeSyncSource === "commerce7" && syncProgress !== null && (
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${syncProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
      
      {/* Sync history panel */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Sync History</h3>
          <p className="mt-1 text-sm text-gray-500">
            Recent synchronization activities and their results.
          </p>
        </div>
        
        <div className="flex">
          <div className={`${selectedHistoryItem ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Changes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {syncHistory.map((item) => {
                  const { label, bgColor, textColor } = getStatusInfo(item.status);
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedHistoryItem?.id === item.id ? 'bg-gray-50' : ''}`}
                      onClick={() => handleHistoryItemClick(item)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="text-green-600">+{item.changes.added}</span>
                        {" / "}
                        <span className="text-blue-600">~{item.changes.updated}</span>
                        {" / "}
                        <span className="text-red-600">-{item.changes.deleted}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                
                {syncHistory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No sync history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Details panel */}
          {selectedHistoryItem && (
            <div className="w-1/2 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Sync Details</h3>
                <button 
                  onClick={() => setSelectedHistoryItem(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Source</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedHistoryItem.source}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Timestamp</h4>
                <p className="mt-1 text-sm text-gray-900">{formatTimestamp(selectedHistoryItem.timestamp)}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(selectedHistoryItem.status).bgColor} ${getStatusInfo(selectedHistoryItem.status).textColor}`}>
                    {getStatusInfo(selectedHistoryItem.status).label}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Changes</h4>
                <div className="mt-1 grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <span className="text-green-600 font-bold text-lg">+{selectedHistoryItem.changes.added}</span>
                    <p className="text-xs text-gray-500 mt-1">Added</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="text-blue-600 font-bold text-lg">~{selectedHistoryItem.changes.updated}</span>
                    <p className="text-xs text-gray-500 mt-1">Updated</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <span className="text-red-600 font-bold text-lg">-{selectedHistoryItem.changes.deleted}</span>
                    <p className="text-xs text-gray-500 mt-1">Deleted</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500">Details</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedHistoryItem.details}</p>
              </div>
              
              {selectedHistoryItem.status !== 'failed' && (
                <button
                  onClick={handleRevert}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Revert Changes
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Scheduling modal */}
      {schedulingModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setSchedulingModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Schedule Sync
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        Set up automatic synchronization schedule for your content sources.
                      </p>
                      
                      <div className="mt-6 space-y-4">
                        {syncSources.map((source) => (
                          <div key={source.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{source.name}</p>
                            </div>
                            <div>
                              <select 
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                defaultValue="daily"
                              >
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="manual">Manual only</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-darkBrown focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSchedulingModalOpen(false)}
                >
                  Save Schedule
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSchedulingModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setting Modal for Website Content */}
      {settingOpen && syncSources.find(source => source.id === settingOpen) && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <Settings className="text-blue-600" size={24} />
                <h2 className="text-lg font-semibold">
                  Settings for {syncSources.find(source => source.id === settingOpen)?.name}
                </h2>
              </div>
              <button onClick={() => setSettingOpen("")} className="text-gray-500 hover:text-gray-800">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Base URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base URL for Scraping
                </label>
                <input
                  type="text"
                  value={webBaseUrl}
                  onChange={handleWebUrlChange}
                  placeholder="https://example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Refresh Button */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Fetch available subdomain URLs from base URL
                </span>
                <button
                  onClick={() => { handleRefreshUrls(); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Refresh URLs
                </button>
              </div>

              {/* URL Structure Display */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Available URLs:</h3>
                {availableUrls.length > 0 ? (
                  <div className="max-h-60 overflow-auto border rounded-lg p-3 bg-gray-50">
                    <ul className="space-y-2">
                      {availableUrls.map((url, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedUrls.includes(url)}
                            onChange={() => handleToggleUrl(url)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-800 break-words truncate"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">{availableUrlsLoading ? "Loading..." : "No URLs fetched. Click refresh."}</div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => setSettingOpen("")}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {handleSaveSettings(webBaseUrl, selectedUrls)}}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SyncControls;