import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  // State definitions
  const [hgvElements, setHgvElements] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    'VOR': 0,
    'On Route': 0,
    'Yard': 0,
    'Running Defect': 0,
  });
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState('Never');
  const [excelUrl, setExcelUrl] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [apiKey, setApiKey] = useState('');
  const [excelSourceType, setExcelSourceType] = useState('googleSheets');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const [showSettings, setShowSettings] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [updateIntervalMs, setUpdateIntervalMs] = useState(10000);
  const [nextUpdate, setNextUpdate] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs
  const papaParseRef = useRef(null);
  const timerRef = useRef(null);
  const updateTimerRef = useRef(null);
  
  // Constants
  const totalHGVs = 50; // Default number of HGVs to generate for mock data

  // Effect for initializing PapaParse
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Papa) {
      papaParseRef.current = window.Papa;
    }
  }, []);

  // Effect for handling data updates
  useEffect(() => {
    // Clear any existing timers when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, []);

  // Effect for handling data fetching based on connection status
  useEffect(() => {
    if (isConnected) {
      // Fetch data immediately
      fetchData();
      
      // Set up interval for automatic updates
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        fetchData();
      }, updateIntervalMs);
      
      // Set up interval for countdown timer
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
      
      setNextUpdate(Math.floor(updateIntervalMs / 1000));
      updateTimerRef.current = setInterval(() => {
        setNextUpdate(prev => (prev > 0 ? prev - 1 : Math.floor(updateIntervalMs / 1000)));
      }, 1000);
    } else {
      // Clear intervals when disconnected
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
        updateTimerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, [isConnected, updateIntervalMs]);

  // Function to fetch data - now properly async
  const fetchData = async () => {
    setShowLoader(true);
    let data = [];
    
    try {
      switch (excelSourceType) {
        case 'mockData':
          // Use mock data for demo
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
          data = generateMockData(totalHGVs);
          break;
          
        case 'googleSheets':
          // Process for Google Sheets
          let sheetUrl = '';
          
          if (excelUrl.includes('docs.google.com')) {
            // Full URL is provided
            sheetUrl = `${excelUrl.replace('/edit#gid=0', '')}/export?format=csv`;
          } else {
            // Just the sheet ID is provided
            sheetUrl = `https://docs.google.com/spreadsheets/d/${excelUrl}/export?format=csv`;
          }
          
          // Fetch CSV data
          const response = await fetch(sheetUrl);
          if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
          
          const csvText = await response.text();
          
          // Parse CSV to data
          if (!papaParseRef.current) {
            throw new Error('PapaParse not loaded');
          }
          
          const parseResult = papaParseRef.current.parse(csvText, {
            header: true,
            skipEmptyLines: true
          });
          
          if (parseResult.errors.length > 0) {
            throw new Error(`CSV parsing error: ${parseResult.errors[0].message}`);
          }
          
          // Transform to our format
          data = parseResult.data.map((row, index) => ({
            id: row.id || `hgv-${index + 1}`,
            name: row.name || `HGV-${index + 1}`,
            status: row.status || 'Yard',
            details: row.details || '',
            lastUpdated: row.lastUpdated || new Date().toLocaleString()
          }));
          break;
          
        case 'sheetdb':
          // Process for SheetDB API
          const apiEndpoint = excelUrl;
          const headers = apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};
          
          const sheetDbResponse = await fetch(apiEndpoint, { headers });
          if (!sheetDbResponse.ok) throw new Error(`Failed to fetch data: ${sheetDbResponse.statusText}`);
          
          const sheetData = await sheetDbResponse.json();
          
          // Transform to our format
          data = sheetData.map(row => ({
            id: row.id || row.ID || `hgv-${Math.random().toString(36).substring(2, 9)}`,
            name: row.name || row.Name || `HGV-${Math.random().toString(36).substring(2, 9)}`,
            status: row.status || row.Status || 'Yard',
            details: row.details || row.Details || '',
            lastUpdated: row.lastUpdated || row['Last Updated'] || new Date().toLocaleString()
          }));
          break;
          
        default:
          throw new Error(`Unsupported Excel source type: ${excelSourceType}`);
      }
      
      // Update state with the fetched data
      setHgvElements(data);
      
      // Update status counts
      const counts = {
        'VOR': 0,
        'On Route': 0,
        'Yard': 0,
        'Running Defect': 0
      };
      
      data.forEach(hgv => {
        if (counts[hgv.status] !== undefined) {
          counts[hgv.status]++;
        }
      });
      
      setStatusCounts(counts);
      
      // Update last updated timestamp
      setLastUpdated(new Date().toLocaleString());
      
      setConnectionStatus('Connected');
      setShowLoader(false);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage(`Failed to fetch data: ${error.message}`);
      setShowErrorModal(true);
      setConnectionStatus(`Error: ${error.message}`);
      setShowLoader(false);
    }
  };

  // Mock data generator function
  const generateMockData = (count) => {
    const statuses = ['VOR', 'On Route', 'Yard', 'Running Defect'];
    const mockData = [];
    
    for (let i = 1; i <= count; i++) {
      mockData.push({
        id: `hgv-${i}`,
        name: `HGV-${i}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        details: `This is vehicle ${i}`,
        lastUpdated: new Date().toLocaleString()
      });
    }
    
    return mockData;
  };

  // Handler functions
  const handleConnectClick = () => {
    if (!isConnected) {
      // Connect logic
      if (excelSourceType !== 'mockData' && !excelUrl) {
        setErrorMessage('Please enter an Excel URL or Sheet ID');
        setShowErrorModal(true);
        return;
      }
      
      setIsConnected(true);
      setConnectionStatus('Connecting...');
      setShowLoader(true);
      
      // Note: fetchData will be called by the useEffect that monitors isConnected
    } else {
      // Disconnect logic
      setModalMessage('Are you sure you want to disconnect? This will stop live updates.');
      setConfirmCallback(() => () => {
        setIsConnected(false);
        setConnectionStatus('Not Connected');
        setHgvElements([]);
        setStatusCounts({
          'VOR': 0,
          'On Route': 0,
          'Yard': 0,
          'Running Defect': 0
        });
        setLastUpdated('Never');
      });
      setShowConfirmModal(true);
    }
  };

  const handleIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value, 10);
    setUpdateIntervalMs(newInterval);
    setNextUpdate(Math.floor(newInterval / 1000));
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleSearchInputChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleClearClick = () => {
    setModalMessage('Are you sure you want to clear all status indicators? This cannot be undone.');
    setConfirmCallback(() => () => {
      // Clear logic here
      setHgvElements(prev => prev.map(hgv => ({
        ...hgv,
        status: 'Yard',
        lastUpdated: new Date().toLocaleString()
      })));
      
      // Update status counts
      setStatusCounts({
        'VOR': 0,
        'On Route': 0,
        'Yard': hgvElements.length,
        'Running Defect': 0
      });
    });
    setShowConfirmModal(true);
  };

  // Filter function for HGV elements
  const filterHGVs = (hgv) => {
    const nameMatch = hgv.name.toLowerCase().includes(searchText.toLowerCase());
    const statusMatch = activeFilter === 'all' || hgv.status === activeFilter;
    return nameMatch && statusMatch;
  };

  // HGV component
  const HGV = ({ hgv }) => {
    // Get status style based on hgv status
    const getStatusStyle = (status) => {
      switch (status) {
        case 'VOR':
          return styles.statusVor;
        case 'On Route':
          return styles.statusRoute;
        case 'Yard':
          return styles.statusYard;
        case 'Running Defect':
          return styles.statusDefect;
        default:
          return styles.statusUnknown;
      }
    };

    return (
      <div style={styles.hgvCard}>
        <div style={{...styles.hgvStatus, ...getStatusStyle(hgv.status)}}>
          {hgv.status}
        </div>
        <div style={styles.hgvName}>{hgv.name}</div>
        <div style={styles.hgvDetails}>{hgv.details}</div>
        <div style={styles.hgvUpdated}>
          Updated: {hgv.lastUpdated}
        </div>
      </div>
    );
  };

  // CSS-in-JS styles
  const keyframes = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const styles = {
    body: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
    },
    h1: {
      textAlign: 'center',
      color: '#333',
      margin: '20px 0 30px 0',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '15px',
      marginTop: '20px',
    },
    hgvCard: {
      backgroundColor: 'white',
      borderRadius: '5px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative',
      transition: 'transform 0.2s',
      cursor: 'pointer',
    },
    hgvStatus: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      borderRadius: '12px',
      padding: '5px 10px',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    statusVor: {
      backgroundColor: '#ffcccc',
      color: '#cc0000',
    },
    statusRoute: {
      backgroundColor: '#ccffcc',
      color: '#006600',
    },
    statusYard: {
      backgroundColor: '#ffffcc',
      color: '#996600',
    },
    statusDefect: {
      backgroundColor: '#ccccff',
      color: '#0000cc',
    },
    statusUnknown: {
      backgroundColor: '#cccccc',
      color: '#666666',
    },
    hgvName: {
      fontWeight: 'bold',
      fontSize: '18px',
      marginBottom: '10px',
      paddingRight: '70px',
    },
    hgvDetails: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '15px',
      height: '40px',
      overflow: 'hidden',
    },
    hgvUpdated: {
      fontSize: '12px',
      color: '#999',
      textAlign: 'right',
      marginTop: '5px',
    },
    dashboardHeader: {
      display: 'flex',
      justifyContent: 'center',
      margin: '20px 0',
    },
    stats: {
      display: 'flex',
      justifyContent: 'space-around',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '5px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    statItem: {
      textAlign: 'center',
      padding: '10px 20px',
      borderRadius: '5px',
    },
    statVor: {
      backgroundColor: '#ffeeee',
    },
    statRoute: {
      backgroundColor: '#eeffee',
    },
    statYard: {
      backgroundColor: '#ffffee',
    },
    statDefect: {
      backgroundColor: '#eeeeff',
    },
    statCount: {
      display: 'block',
      fontSize: '24px',
      fontWeight: 'bold',
      marginTop: '5px',
    },
    searchFilter: {
      backgroundColor: 'white',
      padding: '15px',
      marginBottom: '20px',
      borderRadius: '5px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    searchControls: {
      display: 'flex',
      marginBottom: '15px',
    },
    searchInput: {
      flex: '1',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
    },
    clearBtn: {
      marginLeft: '10px',
      padding: '8px 15px',
      backgroundColor: '#f44336',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    filterBtn: {
      margin: '0 5px',
      padding: '8px 15px',
      backgroundColor: '#f1f1f1',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    filterBtnActive: {
      backgroundColor: '#4CAF50',
      color: 'white',
      borderColor: '#4CAF50',
    },
    lastUpdated: {
      textAlign: 'center',
      fontSize: '14px',
      color: '#666',
      marginTop: '20px',
    },
    excelSettings: {
      backgroundColor: 'white',
      padding: '15px',
      marginBottom: '20px',
      borderRadius: '5px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'max-height 0.3s, opacity 0.3s, padding 0.3s',
      maxHeight: '500px',
      opacity: 1,
      overflow: 'visible',
    },
    excelSettingsHidden: {
      maxHeight: '0',
      padding: '0 15px',
      opacity: '0',
      overflow: 'hidden',
      marginBottom: '0',
    },
    excelH2: {
      fontSize: '18px',
      marginTop: '0',
      marginBottom: '15px',
    },
    excelRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px',
    },
    excelInput: {
      flex: '1',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      marginLeft: '10px',
    },
    excelSelect: {
      flex: '1',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white',
      marginLeft: '10px',
    },
    connectBtn: {
      padding: '8px 15px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px',
    },
    statusConnected: {
      marginLeft: '10px',
      color: '#4CAF50',
      fontWeight: 'bold',
    },
    statusWaiting: {
      marginLeft: '10px',
      color: '#FFA500',
    },
    statusError: {
      marginLeft: '10px',
      color: '#f44336',
    },
    loader: {
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #3498db',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      animation: 'spin 1s linear infinite',
      marginLeft: '10px',
    },
    settingsToggle: {
      display: 'block',
      margin: '0 auto 20px auto',
      padding: '8px 15px',
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    intervalDisplay: {
      fontSize: '14px',
      color: '#666',
    },
    modal: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '9999',
      visibility: 'hidden',
      opacity: '0',
      transition: 'visibility 0s linear 0.25s, opacity 0.25s',
    },
    modalVisible: {
      visibility: 'visible',
      opacity: '1',
      transition: 'visibility 0s linear 0s, opacity 0.25s',
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '5px',
      width: '80%',
      maxWidth: '500px',
      position: 'relative',
    },
    closeModal: {
      position: 'absolute',
      top: '10px',
      right: '15px',
      fontSize: '24px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    modalH2: {
      fontSize: '18px',
      marginTop: '0',
    },
    modalP: {
      marginBottom: '20px',
    },
    modalButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    modalBtn: {
      padding: '8px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginLeft: '10px',
      fontWeight: 'bold',
    },
    modalCancel: {
      backgroundColor: '#f1f1f1',
      border: '1px solid #ddd',
      color: '#333',
    },
    modalConfirm: {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
    },
    modalError: {
      backgroundColor: '#f44336',
      color: 'white',
      border: 'none',
    },
  };

  // The component's return statement with JSX
  return (
    <>
      <Head>
        <title>HGV Status Dashboard</title>
        <meta name="description" content="Track the status of your HGV fleet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      </Head>
      
      <div style={styles.body}>
        <h1 style={styles.h1}>HGV Status Dashboard</h1>
        
        <button 
          style={styles.settingsToggle} 
          onClick={toggleSettings}
        >
          {showSettings ? 'Hide Excel Settings' : 'Show Excel Settings'}
        </button>
        
        <div style={{
          ...styles.excelSettings,
          ...(showSettings ? {} : styles.excelSettingsHidden)
        }}>
          <h2 style={styles.excelH2}>Connect to Online Excel</h2>
          <div style={styles.excelRow}>
            <label htmlFor="excelSource">Source Type:</label>
            <select 
              id="excelSource" 
              value={excelSourceType}
              onChange={(e) => setExcelSourceType(e.target.value)}
              style={styles.excelSelect}
              disabled={isConnected}
            >
              <option value="googleSheets">Google Sheets</option>
              <option value="microsoftExcel">Microsoft Excel Online</option>
              <option value="sheetdb">SheetDB API</option>
              <option value="mockData">Use Mock Data (Demo)</option>
            </select>
          </div>
          <div style={styles.excelRow}>
            <label htmlFor="excelUrl">Excel URL/ID:</label>
            <input 
              type="text" 
              id="excelUrl" 
              placeholder="Paste your Excel URL or Sheet ID here"
              value={excelUrl}
              onChange={(e) => setExcelUrl(e.target.value)}
              style={styles.excelInput}
              disabled={isConnected}
            />
          </div>
          <div style={styles.excelRow}>
            <label htmlFor="sheetName">Sheet Name:</label>
            <input 
              type="text" 
              id="sheetName" 
              placeholder="Sheet1" 
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              style={styles.excelInput}
              disabled={isConnected}
            />
          </div>
          <div style={styles.excelRow}>
            <label htmlFor="apiKey">API Key (if needed):</label>
            <input 
              type="password" 
              id="apiKey" 
              placeholder="Optional"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={styles.excelInput}
              disabled={isConnected}
            />
          </div>
          <div style={styles.excelRow}>
            <label htmlFor="updateInterval">Update Interval:</label>
            <select 
              id="updateInterval" 
              value={updateIntervalMs}
              onChange={handleIntervalChange}
              style={styles.excelSelect}
            >
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
              <option value="30000">30 seconds</option>
              <option value="60000">1 minute</option>
              <option value="300000">5 minutes</option>
            </select>
          </div>
          <div style={styles.excelRow}>
            <button 
              style={styles.connectBtn} 
              onClick={handleConnectClick}
            >
              {isConnected ? 'Disconnect' : 'Connect to Excel'}
            </button>
            <span style={{
              ...(isConnected ? styles.statusConnected : 
                 connectionStatus.includes('Error') ? styles.statusError : 
                 styles.statusWaiting)
            }}>
              {connectionStatus}
            </span>
            {showLoader && <div style={styles.loader}></div>}
          </div>
          <div style={styles.excelRow}>
            <span style={styles.intervalDisplay}>
              Next update in <span>{nextUpdate}</span> seconds
            </span>
          </div>
        </div>
        
        <div style={styles.dashboardHeader}>
          <div style={styles.stats}>
            <div style={{...styles.statItem, ...styles.statVor}}>
              <span>VOR:</span>
              <span style={styles.statCount}>{statusCounts['VOR']}</span>
            </div>
            <div style={{...styles.statItem, ...styles.statRoute}}>
              <span>On Route:</span>
              <span style={styles.statCount}>{statusCounts['On Route']}</span>
            </div>
            <div style={{...styles.statItem, ...styles.statYard}}>
              <span>Yard:</span>
              <span style={styles.statCount}>{statusCounts['Yard']}</span>
            </div>
            <div style={{...styles.statItem, ...styles.statDefect}}>
              <span>Running Defect:</span>
              <span style={styles.statCount}>{statusCounts['Running Defect']}</span>
            </div>
          </div>
        </div>
        
        <div style={styles.searchFilter}>
          <div style={styles.searchControls}>
            <input 
              type="text" 
              placeholder="Search HGV..." 
              value={searchText}
              onChange={handleSearchInputChange}
              style={styles.searchInput}
            />
            <button 
              style={styles.clearBtn} 
              onClick={handleClearClick}
            >
              Clear All Status
            </button>
          </div>
          <div>
            <button 
              style={{
                ...styles.filterBtn, 
                ...(activeFilter === 'all' ? styles.filterBtnActive : {})
              }} 
              onClick={() => handleFilterClick('all')}
            >
              All
            </button>
            <button 
              style={{
                ...styles.filterBtn, 
                ...(activeFilter === 'VOR' ? styles.filterBtnActive : {})
              }} 
              onClick={() => handleFilterClick('VOR')}
            >
              VOR
            </button>
            <button 
              style={{
                ...styles.filterBtn, 
                ...(activeFilter === 'On Route' ? styles.filterBtnActive : {})
              }} 
              onClick={() => handleFilterClick('On Route')}
            >
              On Route
            </button>
            <button 
              style={{
                ...styles.filterBtn, 
                ...(activeFilter === 'Yard' ? styles.filterBtnActive : {})
              }} 
              onClick={() => handleFilterClick('Yard')}
            >
              Yard
            </button>
            <button 
              style={{
                ...styles.filterBtn, 
                ...(activeFilter === 'Running Defect' ? styles.filterBtnActive : {})
              }} 
              onClick={() => handleFilterClick('Running Defect')}
            >
              Running Defect
            </button>
          </div>
        </div>
        
        <div style={styles.grid}>
          {hgvElements.filter(filterHGVs).map(hgv => (
            <HGV key={hgv.id} hgv={hgv} />
          ))}
        </div>
        
        <div style={styles.lastUpdated}>
          Last updated: <span>{lastUpdated}</span>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{...styles.modal, ...styles.modalVisible}}>
          <div style={styles.modalContent}>
            <span 
              style={styles.closeModal}
              onClick={() => setShowConfirmModal(false)}
            >
              &times;
            </span>
            <h2 style={styles.modalH2}>Confirm Action</h2>
            <p style={styles.modalP}>{modalMessage}</p>
            <div style={styles.modalButtons}>
              <button 
                style={{...styles.modalBtn, ...styles.modalCancel}}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                style={{...styles.modalBtn, ...styles.modalConfirm}}
                onClick={() => {
                  setShowConfirmModal(false);
                  if (confirmCallback) confirmCallback();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Modal */}
      {showErrorModal && (
        <div style={{...styles.modal, ...styles.modalVisible}}>
          <div style={styles.modalContent}>
            <span 
              style={styles.closeModal}
              onClick={() => setShowErrorModal(false)}
            >
              &times;
            </span>
            <h2 style={styles.modalH2}>Error</h2>
            <p style={styles.modalP}>{errorMessage}</p>
            <div style={styles.modalButtons}>
              <button 
                style={{...styles.modalBtn, ...styles.modalError}}
                onClick={() => setShowErrorModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Load PapaParse from CDN */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.Papa) {
            papaParseRef.current = window.Papa;
          }
        }}
      />
    </>
  );
}
