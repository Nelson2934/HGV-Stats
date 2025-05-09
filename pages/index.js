import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
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
  const [excelSourceType, setExcelSourceType] = useState('fileUpload');
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
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showDrivers, setShowDrivers] = useState(true); // Show driver names
  const [exportFilename, setExportFilename] = useState('HGV_Data.xlsx'); // Default export filename

  // Refs for timers
  const updateTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const papaParseRef = useRef(null);
  const xlsxRef = useRef(null);
  const exportFileInputRef = useRef(null);

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

  // Load external libraries dynamically
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      // Make sure Papa is loaded
      if (window.Papa) {
        papaParseRef.current = window.Papa;
      }
      // Make sure XLSX is loaded
      if (window.XLSX) {
        xlsxRef.current = window.XLSX;
      }
    }
  }, []);

  // Initialize dashboard with HGVs
  const initializeDashboard = () => {
    const newHgvElements = [];
    const newStatusCounts = {
      'VOR': 0,
      'On Route': 0,
      'Yard': totalHGVs, // All HGVs start as Yard status
      'Running Defect': 0
    };

    // Create HGV elements
    for (let i = 1; i <= totalHGVs; i++) {
      // All start with Yard status
      const defaultStatus = 'Yard';
      
      // Create HGV element
      newHgvElements.push({
        id: i,
        status: defaultStatus,
        location: 'N/A',
        driver: 'N/A'
      });
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
      hgv.id.toString().toLowerCase().includes(searchText.toLowerCase()) ||
      (hgv.driver && hgv.driver !== 'N/A' && hgv.driver.toLowerCase().includes(searchText.toLowerCase()));
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

  // Toggle driver names visibility
  const toggleDrivers = () => {
    setShowDrivers(!showDrivers);
  };

  // Handle file upload button click
  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file upload change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setConnectionStatus('File selected: ' + file.name);
      
      // Set default export filename based on uploaded file
      if (file.name) {
        // Add "Updated_" prefix to the filename
        const nameParts = file.name.split('.');
        if (nameParts.length > 1) {
          const ext = nameParts.pop();
          const baseName = nameParts.join('.');
          setExportFilename(`Updated_${baseName}.${ext}`);
        } else {
          setExportFilename(`Updated_${file.name}`);
        }
      }
    }
  };

  // Handle export filename change
  const handleExportFilenameChange = (e) => {
    setExportFilename(e.target.value);
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
      
      // Only set up timers for non-file upload sources
      if (excelSourceType !== 'fileUpload') {
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
      }
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
    setUploadedFile(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  // Export current data to Excel
  const exportToExcel = () => {
    if (!xlsxRef.current) {
      showErrorDialog('XLSX library not loaded. Please reload the page and try again.');
      return;
    }
    
    try {
      // Prepare data for export
      const dataToExport = hgvElements.map(hgv => ({
        'HGV_Number': hgv.id,
        'Status': hgv.status,
        'Driver': hgv.driver,
        'Location': hgv.location,
        'Last_Updated': new Date().toISOString()
      }));
      
      // Create worksheet
      const ws = xlsxRef.current.utils.json_to_sheet(dataToExport);
      
      // Create workbook
      const wb = xlsxRef.current.utils.book_new();
      xlsxRef.current.utils.book_append_sheet(wb, ws, 'HGV Data');
      
      // Generate file and trigger download
      xlsxRef.current.writeFile(wb, exportFilename);
      
      // Show success message
      showSuccessMessage(`Data exported successfully to ${exportFilename}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      showErrorDialog(`Failed to export data: ${error.message}`);
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
  
  // Show success message with timeout
  const showSuccessMessage = (message) => {
    setConnectionStatus(`Success: ${message}`);
    setTimeout(() => {
      if (isConnected) {
        setConnectionStatus('Connected');
      } else {
        setConnectionStatus('Not connected');
      }
    }, 3000);
  };

  // Handle interval change
  const handleIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value);
    setUpdateIntervalMs(newInterval);
    
    if (isConnected && excelSourceType !== 'fileUpload') {
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

  // Read Excel file
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      if (!xlsxRef.current) {
        reject(new Error('XLSX library not loaded'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = xlsxRef.current.read(data, { type: 'array' });
          
          // Get first sheet name if not specified
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName || firstSheetName];
          
          if (!worksheet) {
            reject(new Error(`Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`));
            return;
          }
          
          // Convert to JSON
          const jsonData = xlsxRef.current.utils.sheet_to_json(worksheet);
          console.log('Excel data loaded:', jsonData.slice(0, 3));
          
          resolve(jsonData);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(new Error(`Failed to parse Excel file: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Fetch HGV data from various sources
  const fetchHGVData = async () => {
    if (!isConnected && excelSourceType !== 'fileUpload') return null;
    
    // Show loader while fetching
    setShowLoader(true);
    setConnectionStatus('Updating...');
    
    try {
      // Different handling based on source type
      let data;
      
      switch (excelSourceType) {
        case 'fileUpload':
          // Process uploaded Excel file
          if (!uploadedFile) throw new Error('No file selected');
          
          const excelData = await readExcelFile(uploadedFile);
          
          // Transform Excel data to our format
          data = excelData.map(row => ({
            hgvNumber: parseInt(row.HGV_Number || row.hgvNumber || row.id || row.ID || row['HGV Number'] || row.hgv || '0'),
            status: row.Status || row.status || 'Yard',
            location: row.Location || row.location || 'N/A',
            driver: row.Driver || row.driver || row.Name || row.name || 'N/A',
            lastUpdated: row.LastUpdated || row.lastUpdated || new Date().toISOString()
          }));
          break;
          
        case 'googleSheets':
          // For a real implementation, you would use the Google Sheets API
          if (!excelUrl && excelUrl !== 'default') throw new Error('Google Sheet URL or ID is required');
          
          // Use our server-side API route to bypass CORS
          let apiUrl = '/api/google-sheet';
          
          // If a custom URL was provided, pass it to the API
          if (excelUrl !== 'default') {
            apiUrl += `?url=${encodeURIComponent(excelUrl)}`;
          }
          
          console.log('Fetching from API:', apiUrl);
          const apiResponse = await fetch(apiUrl);
          
          if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            throw new Error(`Failed to fetch data: ${errorData.error || apiResponse.statusText}`);
          }
          
          const { csv } = await apiResponse.json();
          
          // Parse CSV to data
          if (!papaParseRef.current) {
            throw new Error('PapaParse library not loaded');
          }
          
          const parseResult = papaParseRef.current.parse(csv, { 
            header: true, 
            skipEmptyLines: true,
            dynamicTyping: true
          });
          
          if (parseResult.errors.length > 0) {
            console.warn('CSV parsing errors:', parseResult.errors);
            if (parseResult.errors[0].message.includes('Delimiter')) {
              // Try another delimiter
              const retryResult = papaParseRef.current.parse(csv, { 
                header: true, 
                skipEmptyLines: true,
                dynamicTyping: true,
                delimiter: ',' // Explicitly try comma
              });
              if (retryResult.errors.length === 0 || retryResult.data.length > 0) {
                console.log('Successfully parsed with explicit comma delimiter');
                parseResult.data = retryResult.data;
              }
            }
          }
          
          console.log('Parsed data:', parseResult.data.slice(0, 3));
          
          // Transform to our format
          data = parseResult.data.map(row => ({
            hgvNumber: parseInt(row.HGV_Number || row.hgvNumber || row.id || row.ID || row['HGV Number'] || row.hgv || '0'),
            status: row.Status || row.status || 'Yard',
            location: row.Location || row.location || 'N/A',
            driver: row.Driver || row.driver || row.Name || row.name || 'N/A',
            lastUpdated: row.LastUpdated || row.lastUpdated || new Date().toISOString()
          }));
          break;
          
        case 'microsoftExcel':
          // For a real implementation, you would use Microsoft Graph API
          throw new Error('Microsoft Excel Online integration requires authentication. Try using File Upload instead.');
          
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
            hgvNumber: parseInt(row.HGV_Number || row.hgvNumber || row.id || row.ID || row['HGV Number'] || row.hgv || '0'),
            status: row.Status || row.status || 'Yard',
            location: row.Location || row.location || 'N/A',
            driver: row.Driver || row.driver || row.Name || row.name || 'N/A',
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
      setConnectionStatus(excelSourceType === 'fileUpload' 
        ? `File loaded: ${uploadedFile.name}` 
        : 'Connected');
      
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
    
    // Count remaining HGVs as Yard if they weren't in the data
    for (let i = 0; i < newHgvElements.length; i++) {
      const found = data.some(item => item.hgvNumber === newHgvElements[i].id);
      if (!found) {
        newStatusCounts['Yard']++;
      }
    }
    
    // Update state
    setHgvElements(newHgvElements);
    setStatusCounts(newStatusCounts);
    updateLastUpdated();
  };

  // CSS Styles
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
      overflow: "auto"
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
      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
      gap: "15px",
      padding: "15px",
      justifyContent: "center",
      alignItems: "start",
      height: "70vh",
      overflow: "auto"
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
      fontFamily: "inherit",
      width: "200px"
    },
    filterBtn: {
      padding: "6px 12px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#f0f0f0",
      cursor: "pointer",
      transition: "background-color .2s"
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
    exportBtn: {
      padding: "6px 12px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#009688",
      color: "white",
      cursor: "pointer",
      transition: "all .2s",
      fontWeight: "bold",
      marginLeft: "10px"
    },
    clearBtnHover: {
      backgroundColor: "#e64a19",
      transform: "scale(1.05)"
    },
    lastUpdated: {
      textAlign: "center",
      fontSize: "12px",
      color: "#666",
      marginTop: "10px"
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
    uploadBtn: {
      padding: "8px 16px",
      backgroundColor: "#2196F3",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "all 0.2s"
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
      marginLeft: "10px"
    },
    driversToggle: {
      backgroundColor: "#673ab7",
      color: "white",
      border: "none",
      borderRadius: "5px",
      padding: "5px 10px",
      cursor: "pointer",
      fontSize: "14px",
      marginBottom: "10px"
    },
    fileInput: {
      display: "none" // Hidden file input
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
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
    },
    closeModal: {
      color: "#aaa",
      float: "right",
      fontSize: "28px",
      fontWeight: "bold",
      cursor: "pointer"
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
    // Loader
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
    },
    // HGV styles
    hgv: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "15px",
      borderRadius: "8px",
      backgroundColor: "white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      transition: "transform 0.2s",
      position: "relative"
    },
    select: {
      marginTop: "10px",
      width: "100%",
      padding: "8px",
      borderRadius: "5px",
      border: "1px solid #ccc"
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
      borderImage: 'linear-gradient(to right, #2e7d32 50%, #d32f2f 50%)',
      borderImageSlice: 1,
      borderWidth: "1px",
      borderStyle: "solid"
    },
    // Driver name display
    driverTag: {
      position: "absolute",
      top: "-10px",
      right: "-10px",
      backgroundColor: "#673ab7",
      color: "white",
      padding: "2px 8px",
      borderRadius: "10px",
      fontSize: "11px",
      fontWeight: "bold",
      zIndex: 10,
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      maxWidth: "100px",
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap"
    },
    // Export feature
    exportSection: {
      marginTop: "10px",
      padding: "15px",
      backgroundColor: "#e8f5e9",
      borderRadius: "8px",
      border: "1px solid #c8e6c9"
    },
    exportHeader: {
      fontSize: "16px",
      color: "#2e7d32",
      marginTop: 0,
      marginBottom: "10px"
    }
  };

  // CSS keyframes for animations
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

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
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
  
  .driver-tag {
    animation: fadeIn 0.3s ease-in;
  }
  `;

  // HGV component to display a single HGV with animated truck
  const HGV = ({ hgv }) => {
    const { id, status, location, driver } = hgv;
    
    // Truck styles
    const hgvStyles = {
      hgvContainer: {
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        width: "90px",
        height: "55px",
        margin: "5px auto",
        cursor: "pointer",
        transformOrigin: "bottom center",
        transition: "transform 0.2s"
      },
      cab: {
        width: "20px",
        height: "35px",
        backgroundColor: "#444",
        borderTopLeftRadius: "5px",
        borderBottomLeftRadius: "5px",
        position: "relative",
        boxShadow: "0 2px 4px rgba(0,0,0,.2)"
      },
      trailer: {
        width: "60px",
        height: "35px",
        backgroundColor: "#2196F3",
        borderTopRightRadius: "5px",
        borderBottomRightRadius: "5px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,.2)"
      },
      vorTrailer: {
        backgroundColor: "#d32f2f",
      },
      yardTrailer: {
        backgroundColor: "#1976d2",
      },
      routeTrailer: {
        backgroundColor: "#2e7d32",
      },
      defectTrailer: {
        background: "linear-gradient(to right, #2e7d32 50%, #d32f2f 50%)",
      },
      wheel: {
        width: "10px",
        height: "10px",
        backgroundColor: "#333",
        borderRadius: "50%",
        position: "absolute",
        bottom: "-5px",
        boxShadow: "0 1px 2px rgba(0,0,0,.3)"
      },
      cabWheel: {
        left: "5px"
      },
      trailerWheelLeft: {
        left: "10px"
      },
      trailerWheelRight: {
        right: "10px"
      },
      hgvNumber: {
        color: "white",
        fontWeight: "bold",
        fontSize: "11px",
        textShadow: "1px 1px 1px rgba(0,0,0,.5)"
      },
      tooltip: {
        visibility: "hidden",
        position: "absolute",
        top: "-40px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0,0,0,.8)",
        color: "white",
        padding: "5px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        whiteSpace: "pre-line",
        zIndex: 100,
        opacity: 0,
        transition: "opacity 0.3s, visibility 0.3s"
      },
      vorSign: {
        position: "absolute",
        left: "-15px",
        top: "8px",
        width: "10px",
        height: "10px",
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
        left: "12px"
      },
      smoke2: {
        top: "8px",
        left: "8px"
      },
      smoke3: {
        top: "10px",
        left: "15px"
      },
      road: {
        position: "absolute",
        bottom: "-8px",
        width: "100%",
        height: "4px",
        backgroundColor: "#555",
        borderRadius: "2px",
        zIndex: -1
      }
    };
    
    // Generate tooltip text
    let tooltipText = `HGV ${id}\nStatus: ${status}`;
    if (location && location !== 'N/A') {
      tooltipText += `\nLocation: ${location}`;
    }
    if (driver && driver !== 'N/A') {
      tooltipText += `\nDriver: ${driver}`;
    }
    
    // Determine status class for CSS animations
    const statusClass = status === 'VOR' ? 'vor' : 
                        status === 'On Route' ? 'route' : 
                        status === 'Running Defect' ? 'running-defect' : 
                        'yard';
    
    // Trailer style based on status
    const trailerStyle = {
      ...hgvStyles.trailer,
      ...(status === 'VOR' ? hgvStyles.vorTrailer : 
         status === 'On Route' ? hgvStyles.routeTrailer : 
         status === 'Running Defect' ? hgvStyles.defectTrailer : 
         hgvStyles.yardTrailer)
    };
    
    // Select style based on status
    const selectStyle = {
      ...styles.select,
      ...(status === 'VOR' ? styles.vorSelect : 
         status === 'On Route' ? styles.routeSelect : 
         status === 'Running Defect' ? styles.runningDefectSelect : 
         styles.yardSelect)
    };
    
    // Show driver tag if driver is assigned and showDrivers is true
    const showDriverTag = showDrivers && driver && driver !== 'N/A';
    
    return (
      <div style={styles.hgv}>
        {/* Driver name tag */}
        {showDriverTag && (
          <div className="driver-tag" style={styles.driverTag} title={driver}>
            {driver}
          </div>
        )}
        
        <div className={statusClass} style={{ width: "100%" }}>
          <div className="hgv-container" style={hgvStyles.hgvContainer}>
            <div style={hgvStyles.tooltip}>{tooltipText}</div>
            
            <div style={hgvStyles.cab}>
              <div className="wheel left" style={{...hgvStyles.wheel, ...hgvStyles.cabWheel}}></div>
            </div>
            
            <div style={trailerStyle}>
              <div className="wheel left" style={{...hgvStyles.wheel, ...hgvStyles.trailerWheelLeft}}></div>
              <div className="wheel right" style={{...hgvStyles.wheel, ...hgvStyles.trailerWheelRight}}></div>
              <div style={hgvStyles.hgvNumber}>{id}</div>
            </div>
            
            {(status === 'VOR' || status === 'Running Defect') && (
              <div className="vor-sign" style={hgvStyles.vorSign}></div>
            )}
            
            {status === 'VOR' && (
              <>
                <div className="smoke smoke-1" style={{...hgvStyles.smoke, ...hgvStyles.smoke1}}></div>
                <div className="smoke smoke-2" style={{...hgvStyles.smoke, ...hgvStyles.smoke2}}></div>
                <div className="smoke smoke-3" style={{...hgvStyles.smoke, ...hgvStyles.smoke3}}></div>
              </>
            )}
            
            {status === 'Running Defect' && (
              <>
                <div className="smoke smoke-2" style={{...hgvStyles.smoke, ...hgvStyles.smoke2}}></div>
                <div className="smoke smoke-3" style={{...hgvStyles.smoke, ...hgvStyles.smoke3}}></div>
              </>
            )}
            
            {(status === 'On Route' || status === 'Running Defect') && (
              <div className="road" style={hgvStyles.road}></div>
            )}
          </div>
        </div>
        
        <select 
          value={status}
          onChange={(e) => handleStatusChange(id, e.target.value, status)}
          style={selectStyle}
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
        <meta name="description" content="Track the status of your HGV fleet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      </Head>
      
      <div style={styles.body}>
        <h1 style={styles.h1}>HGV Status Dashboard</h1>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button 
            style={styles.driversToggle} 
            onClick={toggleDrivers}
          >
            {showDrivers ? 'Hide Driver Names' : 'Show Driver Names'}
          </button>
          
          <button 
            style={styles.settingsToggle} 
            onClick={toggleSettings}
          >
            {showSettings ? 'Hide Excel Settings' : 'Show Excel Settings'}
          </button>
        </div>
        
        <div style={{
          ...styles.excelSettings,
          ...(showSettings ? {} : styles.excelSettingsHidden)
        }}>
          <h2 style={styles.excelH2}>Excel Data Source</h2>
          <div style={styles.excelRow}>
            <label htmlFor="excelSource">Source Type:</label>
            <select 
              id="excelSource" 
              value={excelSourceType}
              onChange={(e) => setExcelSourceType(e.target.value)}
              style={styles.excelSelect}
              disabled={isConnected}
            >
              <option value="fileUpload">Excel File Upload</option>
              <option value="googleSheets">Google Sheets</option>
              <option value="microsoftExcel">Microsoft Excel Online</option>
              <option value="sheetdb">SheetDB API</option>
            </select>
          </div>
          
          {/* Show different options based on source type */}
          {excelSourceType === 'fileUpload' ? (
            <div style={styles.excelRow}>
              <label htmlFor="excelFile">Excel File:</label>
              <input 
                type="file" 
                id="excelFile"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={styles.fileInput}
                disabled={isConnected}
              />
              <button 
                style={styles.uploadBtn} 
                onClick={handleFileUploadClick}
                disabled={isConnected}
              >
                Select Excel File
              </button>
              <span>{uploadedFile ? uploadedFile.name : 'No file selected'}</span>
            </div>
          ) : (
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
          )}
          
          {excelSourceType !== 'fileUpload' && (
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
          )}
          
          {excelSourceType === 'sheetdb' && (
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
          )}
          
          {excelSourceType !== 'fileUpload' && (
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
          )}
          
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
          
          {excelSourceType !== 'fileUpload' && isConnected && (
            <div style={styles.excelRow}>
              <span style={styles.intervalDisplay}>
                Next update in <span>{nextUpdate}</span> seconds
              </span>
            </div>
          )}
          
          {/* Export Section */}
          {isConnected && (
            <div style={styles.exportSection}>
              <h3 style={styles.exportHeader}>Export Current Data</h3>
              <div style={styles.excelRow}>
                <label htmlFor="exportFilename">Export Filename:</label>
                <input 
                  type="text" 
                  id="exportFilename" 
                  placeholder="HGV_Data.xlsx" 
                  value={exportFilename}
                  onChange={handleExportFilenameChange}
                  style={styles.excelInput}
                />
                <button 
                  style={styles.exportBtn} 
                  onClick={exportToExcel}
                >
                  Export to Excel
                </button>
              </div>
              <p style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}>
                This will export the current HGV data with all your changes to an Excel file.
              </p>
            </div>
          )}
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
              placeholder="Search HGV or Driver..." 
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
            {/* Quick Export Button */}
            {isConnected && (
              <button 
                style={styles.exportBtn} 
                onClick={exportToExcel}
              >
                Export
              </button>
            )}
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
      
      {/* Load required libraries */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="beforeInteractive"
      />
    </>
  );
}
