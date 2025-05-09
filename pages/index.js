import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  // CSS styles for the dashboard
  const styles = {
    body: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "20px",
      backgroundColor: "#f8f9fa",
      margin: "0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100vh",
      overflow: "hidden"
    },
    h1: {
      textAlign: "center",
      marginBottom: "30px",
      color: "#1e3a8a",
      fontSize: "28px"
    },
    dashboardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 20px",
      marginBottom: "20px"
    },
    stats: {
      display: "flex",
      gap: "20px",
      fontWeight: "bold"
    },
    statItem: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      padding: "5px 10px",
      borderRadius: "5px"
    },
    statVor: {
      backgroundColor: "#ffebee",
      color: "#d32f2f"
    },
    statRoute: {
      backgroundColor: "#e8f5e9",
      color: "#2e7d32"
    },
    statYard: {
      backgroundColor: "#e3f2fd",
      color: "#1976d2"
    },
    statDefect: {
      background: 'linear-gradient(to right, #e8f5e9 50%, #ffebee 50%)',
      color: "#333"
    },
    statCount: {
      fontSize: "18px"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
      gap: "10px",
      justifyContent: "center",
      alignItems: "center",
      height: "80%",
      overflow: "auto",
      padding: "10px"
    },
    hgv: {
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transition: "transform .2s ease-in-out"
    },
    hgvHover: {
      transform: "scale(1.05)"
    },
    hgvContainer: {
      position: "relative",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      margin: "0 auto",
      width: "90%",
      maxWidth: "110px",
      cursor: "pointer",
      transformOrigin: "bottom center"
    },
    cab: {
      width: "25px",
      height: "45px",
      backgroundColor: "#444",
      borderTopLeftRadius: "5px",
      borderBottomLeftRadius: "5px",
      position: "relative",
      boxShadow: "0 2px 4px rgba(0,0,0,.2)"
    },
    trailer: {
      width: "70px",
      height: "45px",
      backgroundColor: "#2196F3",
      borderTopRightRadius: "5px",
      borderBottomRightRadius: "5px",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "transform .2s ease-in-out",
      boxShadow: "0 2px 4px rgba(0,0,0,.2)"
    },
    trailerVor: {
      backgroundColor: "#d32f2f"
    },
    trailerYard: {
      backgroundColor: "#1976d2"
    },
    trailerRoute: {
      backgroundColor: "#2e7d32"
    },
    trailerDefect: {
      background: 'linear-gradient(to right, #2e7d32 50%, #d32f2f 50%)'
    },
    hgvNumber: {
      color: "white",
      fontWeight: "bold",
      fontSize: "12px",
      textShadow: "1px 1px 1px rgba(0,0,0,.5)"
    },
    wheel: {
      width: "12px",
      height: "12px",
      backgroundColor: "#333",
      borderRadius: "50%",
      position: "absolute",
      bottom: "-8px",
      boxShadow: "0 2px 3px rgba(0,0,0,.3)"
    },
    wheelCabLeft: {
      left: "5px"
    },
    wheelTrailerLeft: {
      left: "10px"
    },
    wheelTrailerRight: {
      right: "10px"
    },
    select: {
      marginTop: "10px",
      width: "80%",
      padding: "6px",
      borderRadius: "5px",
      textAlign: "center",
      border: "1px solid #ccc",
      appearance: "none",
      backgroundColor: "white",
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg fill='%23333' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 5px center",
      cursor: "pointer",
      fontFamily: "inherit",
      transition: "all .2s ease"
    },
    vorSelect: {
      borderColor: "#d32f2f"
    },
    routeSelect: {
      borderColor: "#2e7d32"
    },
    yardSelect: {
      borderColor: "#1976d2"
    },
    runningDefectSelect: {
      border: "1px solid",
      borderImage: 'linear-gradient(to right, #2e7d32 50%, #d32f2f 50%)',
      borderImageSlice: 1
    },
    vorSign: {
      position: "absolute",
      left: "-20px",
      top: "10px",
      width: "14px",
      height: "14px",
      backgroundColor: "#d32f2f",
      borderRadius: "2px",
      boxShadow: "0 0 5px #d32f2f",
      zIndex: 10
    },
    smoke: {
      position: "absolute",
      width: "8px",
      height: "8px",
      backgroundColor: "rgba(150,150,150,.8)",
      borderRadius: "50%",
      opacity: 0
    },
    smoke1: {
      top: "5px",
      left: "15px",
      animation: "smoke-rise 3s infinite",
      animationDelay: "0s"
    },
    smoke2: {
      top: "8px",
      left: "10px",
      animation: "smoke-rise 3s infinite",
      animationDelay: "1s"
    },
    smoke3: {
      top: "12px",
      left: "20px",
      animation: "smoke-rise 3s infinite",
      animationDelay: "2s"
    },
    road: {
      position: "absolute",
      bottom: "-12px",
      width: "110%",
      height: "6px",
      backgroundColor: "#555",
      borderRadius: "2px",
      zIndex: -1
    },
    tooltip: {
      visibility: "hidden",
      position: "absolute",
      top: "-40px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "rgba(0,0,0,.8)",
      color: "white",
      padding: "5px 10px",
      borderRadius: "4px",
      fontSize: "12px",
      whiteSpace: "nowrap",
      zIndex: 100,
      transition: "visibility 0s, opacity .3s",
      opacity: 0
    },
    tooltipVisible: {
      visibility: "visible",
      opacity: 1
    },
    lastUpdated: {
      textAlign: "center",
      fontSize: "12px",
      color: "#666",
      marginTop: "20px"
    },
    searchFilter: {
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
      marginBottom: "15px",
      padding: "0 20px"
    },
    searchControls: {
      display: "flex",
      gap: "10px"
    },
    searchInput: {
      padding: "6px 10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontFamily: "inherit"
    },
    searchInputFocus: {
      outline: "none",
      borderColor: "#2196F3"
    },
    filterBtn: {
      padding: "6px 12px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#f0f0f0",
      cursor: "pointer",
      transition: "background-color .2s"
    },
    filterBtnHover: {
      backgroundColor: "#e0e0e0"
    },
    filterBtnActive: {
      backgroundColor: "#2196F3",
      color: "white"
    },
    clearBtn: {
      padding: "6px 12px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#ff5722",
      color: "white",
      cursor: "pointer",
      transition: "all .2s",
      fontWeight: "bold"
    },
    clearBtnHover: {
      backgroundColor: "#e64a19",
      transform: "scale(1.05)"
    },
    clearBtnActive: {
      transform: "scale(.98)"
    },
    
    // Excel Settings styles
    excelSettings: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      padding: "20px",
      marginBottom: "20px",
      backgroundColor: "#f0f8ff",
      borderRadius: "8px",
      border: "1px solid #bed6f5"
    },
    excelSettingsHidden: {
      height: 0,
      overflow: "hidden",
      padding: 0,
      margin: 0,
      border: "none",
      transition: "all 0.3s"
    },
    excelH2: {
      marginTop: 0,
      fontSize: "18px",
      color: "#1e3a8a"
    },
    excelRow: {
      display: "flex",
      gap: "10px",
      alignItems: "center"
    },
    excelInput: {
      flex: 1,
      padding: "8px",
      borderRadius: "5px",
      border: "1px solid #ccc"
    },
    excelSelect: {
      flex: 1,
      padding: "8px",
      borderRadius: "5px",
      border: "1px solid #ccc"
    },
    connectBtn: {
      padding: "8px 16px",
      backgroundColor: "#4caf50",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "all 0.2s"
    },
    connectBtnHover: {
      backgroundColor: "#3e8e41",
      transform: "scale(1.05)"
    },
    connectBtnActive: {
      transform: "scale(0.98)"
    },
    statusLabel: {
      fontWeight: "bold",
      color: "#1e3a8a"
    },
    statusValue: {
      fontWeight: "normal",
      color: "#333"
    },
    statusConnected: {
      color: "#2e7d32"
    },
    statusError: {
      color: "#d32f2f"
    },
    statusWaiting: {
      color: "#ff9800"
    },
    excelDisabled: {
      backgroundColor: "#f5f5f5",
      cursor: "not-allowed"
    },
    intervalDisplay: {
      fontSize: "12px",
      color: "#666"
    },
    settingsToggle: {
      backgroundColor: "#1e3a8a",
      color: "white",
      border: "none",
      borderRadius: "5px",
      padding: "5px 10px",
      cursor: "pointer",
      fontSize: "14px",
      marginBottom: "10px",
      alignSelf: "flex-end"
    },
    
    // Modal styles
    modal: {
      display: "none",
      position: "fixed",
      zIndex: 1000,
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.7)",
      overflow: "auto"
    },
    modalVisible: {
      display: "block"
    },
    modalContent: {
      backgroundColor: "#f8f9fa",
      margin: "15% auto",
      padding: "20px",
      borderRadius: "8px",
      width: "50%",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      animation: "modalopen 0.4s"
    },
    closeModal: {
      color: "#aaa",
      float: "right",
      fontSize: "28px",
      fontWeight: "bold",
      cursor: "pointer"
    },
    closeModalHover: {
      color: "#000"
    },
    modalH2: {
      marginTop: 0,
      color: "#1e3a8a"
    },
    modalP: {
      marginBottom: "20px"
    },
    modalButtons: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px"
    },
    modalBtn: {
      padding: "8px 16px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold"
    },
    modalCancel: {
      backgroundColor: "#f0f0f0",
      color: "#333"
    },
    modalConfirm: {
      backgroundColor: "#4caf50",
      color: "white"
    },
    modalError: {
      backgroundColor: "#d32f2f",
      color: "white"
    },
    
    // Loader animation
    loader: {
      display: "inline-block",
      width: "20px",
      height: "20px",
      border: "3px solid rgba(0,0,0,0.1)",
      borderRadius: "50%",
      borderTop: "3px solid #2196F3",
      animation: "spin 1s ease-in-out infinite",
      marginLeft: "10px",
      verticalAlign: "middle"
    },
    hidden: {
      display: "none"
    }
  };

  // CSS keyframes
  const keyframes = `
  @keyframes driving {
    0% { transform: translateX(0) translateY(0); }
    10% { transform: translateX(-1px) translateY(1px); }
    20% { transform: translateX(0) translateY(.5px); }
    30% { transform: translateX(1px) translateY(0); }
    40% { transform: translateX(0) translateY(-.5px); }
    50% { transform: translateX(-.5px) translateY(-1px); }
    60% { transform: translateX(0) translateY(-.5px); }
    70% { transform: translateX(.5px) translateY(0); }
    80% { transform: translateX(0) translateY(.5px); }
    90% { transform: translateX(-.5px) translateY(1px); }
    100% { transform: translateX(0) translateY(0); }
  }

  @keyframes wheel-rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes breakdown {
    0% { transform: translateY(0); }
    25% { transform: translateY(-1px); }
    50% { transform: translateY(1px); }
    75% { transform: translateY(-.5px); }
    100% { transform: translateY(0); }
  }

  @keyframes combined {
    0% { transform: translateX(0) translateY(0); }
    10% { transform: translateX(-1px) translateY(1px); }
    20% { transform: translateX(0) translateY(.5px); }
    30% { transform: translateX(1px) translateY(0); }
    40% { transform: translateX(0) translateY(-.5px); }
    50% { transform: translateX(-.5px) translateY(-1px); }
    60% { transform: translateX(0) translateY(-.5px); }
    70% { transform: translateX(.5px) translateY(0); }
    75% { transform: translateY(1px); }
    80% { transform: translateX(0) translateY(.5px); }
    85% { transform: translateY(-.5px); }
    90% { transform: translateX(-.5px) translateY(1px); }
    95% { transform: translateY(-.5px); }
    100% { transform: translateX(0) translateY(0); }
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; box-shadow: 0 0 5px #d32f2f; }
    50% { transform: scale(1.5); opacity: .8; box-shadow: 0 0 10px #ff0000; }
    100% { transform: scale(1); opacity: 1; box-shadow: 0 0 5px #d32f2f; }
  }

  @keyframes smoke-rise {
    0% { transform: translate(0,0); opacity: .8; width: 5px; height: 5px; }
    100% { transform: translate(-10px,-25px); opacity: 0; width: 15px; height: 15px; }
  }

  @keyframes road-move {
    0% { transform: translateX(10px); }
    100% { transform: translateX(-10px); }
  }

  @keyframes modalopen {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .route .hgv-container, .running-defect .hgv-container {
    animation: driving 3s infinite ease-in-out;
  }

  .route .wheel, .running-defect .wheel {
    animation: wheel-rotation 2s infinite linear;
  }

  .vor .hgv-container {
    animation: breakdown .8s infinite;
  }

  .running-defect .hgv-container {
    animation: combined 4s infinite ease-in-out;
  }

  .vor .vor-sign, .running-defect .vor-sign {
    animation: pulse 1s infinite;
  }

  .road:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: repeating-linear-gradient(to right, #fff, #fff 10px, transparent 10px, transparent 20px);
    animation: road-move 1s infinite linear;
  }

  .hgv-container:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  `;

  // State variables
  const [hgvElements, setHgvElements] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    'VOR': 0,
    'On Route': 0,
    'Yard': 0,
    'Running Defect': 0
  });
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState('Not yet updated');
  const [showSettings, setShowSettings] = useState(false);
  const [excelSourceType, setExcelSourceType] = useState('mockData');
  const [excelUrl, setExcelUrl] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [apiKey, setApiKey] = useState('');
  const [updateIntervalMs, setUpdateIntervalMs] = useState(10000);
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [isConnected, setIsConnected] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [nextUpdate, setNextUpdate] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);
  const [totalHGVs, setTotalHGVs] = useState(57);
  const [hgvData, setHgvData] = useState([]);

  // Refs for timers
  const updateTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const papaParseRef = useRef(null);

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
    updateLastUpdated();
    
    // Cleanup timers on unmount
    return () => {
      if (updateTimerRef.current) clearInterval(updateTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Load Papa Parse dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Papa) {
      papaParseRef.current = window.Papa;
    }
  }, []);

  // Initialize dashboard with HGVs
  const initializeDashboard = () => {
    const newHgvElements = [];
    const newStatusCounts = {
      'VOR': 0,
      'On Route': 0,
      'Yard': 0,
      'Running Defect': 0
    };

    // Create HGV elements
    for (let i = 1; i <= totalHGVs; i++) {
      // Default to random status if no data
      const statusOptions = ['VOR', 'On Route', 'Yard', 'Running Defect'];
      const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      
      // Create HGV element
      newHgvElements.push({
        id: i,
        status: randomStatus,
        location: 'N/A',
        driver: 'N/A'
      });
      
      // Increment status count
      newStatusCounts[randomStatus]++;
    }
    
    setHgvElements(newHgvElements);
    setStatusCounts(newStatusCounts);
  };

  // Update the "last updated" timestamp
  const updateLastUpdated = () => {
    setLastUpdated(new Date().toLocaleString());
  };

  // Handle status change for an HGV
  const handleStatusChange = (id, newStatus, previousStatus) => {
    setStatusCounts(prev => ({
      ...prev,
      [previousStatus]: prev[previousStatus] - 1,
      [newStatus]: prev[newStatus] + 1
    }));
    
    setHgvElements(prev => prev.map(hgv => 
      hgv.id === id ? { ...hgv, status: newStatus } : hgv
    ));
    
    updateLastUpdated();
  };

  // Filter HGVs based on search input and filter button
  const filterHGVs = (hgv) => {
    const matchesSearch = searchText === '' || 
      hgv.id.toString().toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = activeFilter === 'all' || hgv.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchText(e.target.value);
  };

  // Handle filter button click
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  // Handle clear button click
  const handleClearClick = () => {
    showConfirmDialog(
      'Are you sure you want to set all HGVs to "Yard" status?',
      () => {
        const newStatusCounts = {
          'VOR': 0,
          'On Route': 0,
          'Yard': totalHGVs,
          'Running Defect': 0
        };
        
        setHgvElements(prev => prev.map(hgv => ({ ...hgv, status: 'Yard' })));
        setStatusCounts(newStatusCounts);
        updateLastUpdated();
      }
    );
  };

  // Toggle settings visibility
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Connect to Excel
  const connectToExcel = async () => {
    // Stop any existing timers
    if (updateTimerRef.current) {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = null;
    }
    
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    
    // Set connection status
    setConnectionStatus('Connecting...');
    setShowLoader(true);
    
    // Initial data fetch
    const initialData = await fetchHGVData();
    
    if (initialData) {
      // Connection successful
      setIsConnected(true);
      
      // Update HGVs with data
      updateHGVsFromData(initialData);
      
      // Start update timer
      updateTimerRef.current = setInterval(async () => {
        const newData = await fetchHGVData();
        if (newData) {
          updateHGVsFromData(newData);
        }
      }, updateIntervalMs);
      
      // Start countdown timer
      let countdown = updateIntervalMs / 1000;
      setNextUpdate(countdown);
      
      countdownTimerRef.current = setInterval(() => {
        countdown--;
        if (countdown < 0) {
          countdown = updateIntervalMs / 1000;
        }
        setNextUpdate(countdown);
      }, 1000);
    } else {
      // Connection failed
      setIsConnected(false);
      setShowLoader(false);
    }
  };

  // Disconnect from Excel
  const disconnectFromExcel = () => {
    // Stop timers
    if (updateTimerRef.current) {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = null;
    }
    
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    
    // Update status
    setIsConnected(false);
    setConnectionStatus('Disconnected');
  };

  // Handle connect/disconnect button click
  const handleConnectClick = () => {
    if (isConnected) {
      // Already connected, so disconnect
      showConfirmDialog(
        'Are you sure you want to disconnect from Excel?',
        disconnectFromExcel
      );
    } else {
      // Not connected, so connect
      connectToExcel();
    }
  };

  // Show confirmation modal
  const showConfirmDialog = (message, callback) => {
    setModalMessage(message);
    setConfirmCallback(() => callback);
    setShowConfirmModal(true);
  };

  // Show error modal
  const showErrorDialog = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  // Handle interval change
  const handleIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value);
    setUpdateIntervalMs(newInterval);
    
    if (isConnected) {
      // Update interval if connected
      
      // Restart timers with new interval
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
        updateTimerRef.current = setInterval(async () => {
          const newData = await fetchHGVData();
          if (newData) {
            updateHGVsFromData(newData);
          }
        }, newInterval);
      }
      
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        let countdown = newInterval / 1000;
        setNextUpdate(countdown);
        
        countdownTimerRef.current = setInterval(() => {
          countdown--;
          if (countdown < 0) {
            countdown = newInterval / 1000;
          }
          setNextUpdate(countdown);
        }, 1000);
      }
    }
  };

  // Fetch HGV data from Excel or mock data
  const fetchHGVData = async () => {
    if (!isConnected && excelSourceType !== 'mockData') return null;
    
    // Show loader while fetching
    setShowLoader(true);
    setConnectionStatus('Updating...');
    
    try {
      // Different handling based on source type
      let data;
      
      switch (excelSourceType) {
        case 'mockData':
          // Use mock data for demo
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
          data = generateMockData(totalHGVs);
          break;
          
        case 'googleSheets':
          // For a real implementation, you would use the Google Sheets API
          if (!excelUrl) throw new Error('Google Sheet URL or ID is required');
          
          // Check if URL is provided or just ID
          let sheetUrl = excelUrl;
          
          // If it looks like just an ID, form the export URL
          if (!sheetUrl.includes('http')) {
            sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetUrl}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
          } else if (!sheetUrl.includes('out:csv')) {
            // If it's a full URL but not export URL, try to form export URL
            // Extract ID from URL (this is simplified)
            const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (match && match[1]) {
              sheetUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
            } else {
              throw new Error('Invalid Google Sheets URL format');
            }
          }
          
          // Fetch CSV data
          const response = await fetch(sheetUrl);
          if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
          
          const csvText = await response.text();
          
          // Parse CSV to data
          if (!papaParseRef.current) {
            throw new Error('PapaParse library not loaded');
          }
          const parseResult = papaParseRef.current.parse(csvText, { header: true, skipEmptyLines: true });
          if (parseResult.errors.length > 0) {
            throw new Error(`CSV parsing error: ${parseResult.errors[0].message}`);
          }
          
          // Transform to our format
          data = parseResult.data.map(row => ({
            hgvNumber: parseInt(row.HGV_Number || row.hgvNumber || row.id || row.ID || row['HGV Number'] || '0'),
            status: row.Status || row.status || 'Yard',
            location: row.Location || row.location || 'N/A',
            driver: row.Driver || row.driver || 'N/A',
            lastUpdated: row.LastUpdated || row.lastUpdated || new Date().toISOString()
          }));
          break;
          
        case 'microsoftExcel':
          // For a real implementation, you would use Microsoft Graph API
          throw new Error('Microsoft Excel Online integration requires authentication. Try using the Mock Data option for demonstration.');
          
        case 'sheetdb':
          // SheetDB is a service that provides API access to Google Sheets
          if (!excelUrl) throw new Error('SheetDB API endpoint is required');
          
          const apiEndpoint = excelUrl;
          const headers = apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};
          
          const sheetDbResponse = await fetch(apiEndpoint, { headers });
          if (!sheetDbResponse.ok) throw new Error(`Failed to fetch data: ${sheetDbResponse.statusText}`);
          
          const sheetData = await sheetDbResponse.json();
          
          // Transform to our format
          data = sheetData.map(row => ({
            hgvNumber: parseInt(row.HGV_Number || row.hgvNumber || row.id || row.ID || row['HGV Number'] || '0'),
            status: row.Status || row.status || 'Yard',
            location: row.Location || row.location || 'N/A',
            driver: row.Driver || row.driver || 'N/A',
            lastUpdated: row.LastUpdated || row.lastUpdated || new Date().toISOString()
          }));
          break;
          
        default:
          throw new Error('Unknown data source type');
      }
      
      // Validate and clean data
      data = data.filter(item => !isNaN(item.hgvNumber) && item.hgvNumber > 0);
      
      // Ensure status is one of the valid options
      const validStatuses = ['VOR', 'On Route', 'Yard', 'Running Defect'];
      data.forEach(item => {
        if (!validStatuses.includes(item.status)) {
          item.status = 'Yard'; // Default to Yard for invalid status
        }
      });
      
      // Update total HGVs if data contains more
      if (data.length > totalHGVs) {
        setTotalHGVs(data.length);
      }
      
      // Hide loader and update status
      setShowLoader(false);
      setConnectionStatus('Connected');
      
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Hide loader and update status
      setShowLoader(false);
      setConnectionStatus(`Error: ${error.message}`);
      
      // Show error modal
      showErrorDialog(`Failed to fetch data: ${error.message}`);
      
      return null;
    }
  };

  // Generate mock data for demo purposes
  const generateMockData = (numHGVs = totalHGVs) => {
    const statuses = ['VOR', 'On Route', 'Yard', 'Running Defect'];
    const mockData = [];
    
    for (let i = 1; i <= numHGVs; i++) {
      // Weighted distribution to make it more realistic
      let statusIndex;
      const rand = Math.random();
      if (rand < 0.15) statusIndex = 0; // 15% VOR
      else if (rand < 0.55) statusIndex = 1; // 40% On Route
      else if (rand < 0.80) statusIndex = 2; // 25% Yard
      else statusIndex = 3; // 20% Running Defect
      
      mockData.push({
        hgvNumber: i,
        status: statuses[statusIndex],
        location: statusIndex === 1 ? ['London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow'][Math.floor(Math.random() * 5)] : 'N/A',
        driver: statusIndex === 1 ? ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor'][Math.floor(Math.random() * 5)] : 'N/A',
        lastUpdated: new Date().toISOString()
      });
    }
    
    return mockData;
  };

  // Update HGV displays with new data
  const updateHGVsFromData = (data) => {
    if (!data || !Array.isArray(data)) return;
    
    // Store data for reference
    setHgvData(data);
    
    // Reset status counts
    const newStatusCounts = {
      'VOR': 0,
      'On Route': 0,
      'Yard': 0,
      'Running Defect': 0
    };
    
    // Process each HGV with data
    const newHgvElements = [...hgvElements];
    
    // First extend array if needed
    while (newHgvElements.length < data.length) {
      newHgvElements.push({
        id: newHgvElements.length + 1,
        status: 'Yard',
        location: 'N/A',
        driver: 'N/A'
      });
    }
    
    // Update each HGV with data
    data.forEach(hgvData => {
      const hgvIndex = hgvData.hgvNumber - 1;
      
      // Validate index
      if (hgvIndex < 0 || hgvIndex >= newHgvElements.length) return;
      
      // Update HGV
      newHgvElements[hgvIndex] = {
        ...newHgvElements[hgvIndex],
        id: hgvData.hgvNumber,
        status: hgvData.status,
        location: hgvData.location,
        driver: hgvData.driver
      };
      
      // Count statuses
      newStatusCounts[hgvData.status]++;
    });
    
    // Update state
    setHgvElements(newHgvElements);
    setStatusCounts(newStatusCounts);
    updateLastUpdated();
  };

  // HGV component to display a single HGV
  const HGV = ({ hgv }) => {
    const { id, status, location, driver } = hgv;
    
    // CSS classes based on status
    const containerClass = `hgv-container ${status === 'VOR' ? 'vor' : status === 'On Route' ? 'route' : status === 'Running Defect' ? 'running-defect' : 'yard'}`;
    
    const selectClass = `${styles.select} ${
      status === 'VOR' ? styles.vorSelect : 
      status === 'On Route' ? styles.routeSelect : 
      status === 'Running Defect' ? styles.runningDefectSelect : 
      styles.yardSelect
    }`;
    
    const trailerClass = `${styles.trailer} ${
      status === 'VOR' ? styles.trailerVor : 
      status === 'On Route' ? styles.trailerRoute : 
      status === 'Running Defect' ? styles.trailerDefect : 
      styles.trailerYard
    }`;
    
    // Generate tooltip text
    let tooltipText = `HGV ${id} - ${status}`;
    if (location && location !== 'N/A') {
      tooltipText += `\nLocation: ${location}`;
    }
    if (driver && driver !== 'N/A') {
      tooltipText += `\nDriver: ${driver}`;
    }
    
    return (
      <div style={styles.hgv}>
        <div className={containerClass} style={styles.hgvContainer}>
          <div className="tooltip" style={styles.tooltip}>{tooltipText}</div>
          
          <div style={styles.cab}>
            <div className="wheel left" style={{...styles.wheel, ...styles.wheelCabLeft}}></div>
          </div>
          
          <div className="trailer" style={trailerClass}>
            <div className="wheel left" style={{...styles.wheel, ...styles.wheelTrailerLeft}}></div>
            <div className="wheel right" style={{...styles.wheel, ...styles.wheelTrailerRight}}></div>
            <div style={styles.hgvNumber}>HGV {id}</div>
          </div>
          
          {(status === 'VOR' || status === 'Running Defect') && (
            <div className="vor-sign" style={styles.vorSign}></div>
          )}
          
          {(status === 'VOR') && (
            <>
              <div className="smoke smoke-1" style={{...styles.smoke, ...styles.smoke1}}></div>
              <div className="smoke smoke-2" style={{...styles.smoke, ...styles.smoke2}}></div>
              <div className="smoke smoke-3" style={{...styles.smoke, ...styles.smoke3}}></div>
            </>
          )}
          
          {(status === 'Running Defect') && (
            <>
              <div className="smoke smoke-2" style={{...styles.smoke, ...styles.smoke2}}></div>
              <div className="smoke smoke-3" style={{...styles.smoke, ...styles.smoke3}}></div>
            </>
          )}
          
          {(status === 'On Route' || status === 'Running Defect') && (
            <div className="road" style={styles.road}></div>
          )}
        </div>
        
        <select 
          value={status} 
          style={selectClass}
          onChange={(e) => handleStatusChange(id, e.target.value, status)}
        >
          <option value="VOR">VOR</option>
          <option value="On Route">On Route</option>
          <option value="Yard">Yard</option>
          <option value="Running Defect">Running Defect</option>
        </select>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>HGV Status Dashboard</title>
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
            <span className={
              isConnected ? styles.statusConnected : 
              connectionStatus.includes('Error') ? styles.statusError : 
              styles.statusWaiting
            }>
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
        strategy="beforeInteractive"
      />
    </>
  );
}
